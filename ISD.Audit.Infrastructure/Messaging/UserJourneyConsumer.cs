using ISD.Aduit.Infrastructure.Persistence;
using ISD.Audit.Domain.Models;
using ISD.Audit.Infrastructure.Messaging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using System.Threading.Channels;
using ISD.Audit.Infrastructure.Sanitization;
using ISD.Audit.Shared.Contract.Events;

namespace ISD.Audit.Infrastructure.Messaging;

public sealed class UserJourneyConsumer : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<UserJourneyConsumer> _logger;
    private readonly RabbitMqOptions _options;
    private readonly AuditBatchOptions _batchOptions;

    private IConnection? _connection;
    private IChannel? _channel;

    // Buffer داخلي: بتوصله الرسائل أول ما توصل من رابيت، من غير ما نعمل Ack فورًا
    private readonly Channel<BufferedJourneyMessage> _buffer =
        Channel.CreateUnbounded<BufferedJourneyMessage>(new UnboundedChannelOptions
        {
            SingleReader = true,   // Loop الفلاش بس هو اللي بيقرا
            SingleWriter = false   // ReceivedAsync ممكن يندى بالتوازي حسب الـ prefetch
        });

    public UserJourneyConsumer(
        IServiceProvider serviceProvider,
        ILogger<UserJourneyConsumer> logger,
        IOptions<RabbitMqOptions> options,
        IOptions<AuditBatchOptions> batchOptions)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _options = options.Value;
        _batchOptions = batchOptions.Value;
    }

    public override async Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            var factory = new ConnectionFactory
            {
                HostName = _options.HostName,
                UserName = _options.UserName,
                Password = _options.Password
            };

            _connection = await factory.CreateConnectionAsync(cancellationToken);
            _channel = await _connection.CreateChannelAsync(cancellationToken: cancellationToken);

            await _channel.QueueDeclareAsync(
                queue: _options.QueueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                cancellationToken: cancellationToken);

            // مهم: الـ prefetch لازم يكون أكبر من أو يساوي BatchSize
            // عشان رابيت يسمح تجميع رسائل كفاية قبل ما ننتظر Ack
            await _channel.BasicQosAsync(
                prefetchSize: 0,
                prefetchCount: (ushort)Math.Max(_batchOptions.BatchSize * 2, 20),
                global: false,
                cancellationToken: cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize RabbitMQ connection for Audit module.");
        }

        await base.StartAsync(cancellationToken);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (_channel is null) return;

        var consumer = new AsyncEventingBasicConsumer(_channel);

        consumer.ReceivedAsync += async (_, ea) =>
        {
            try
            {
                var json = Encoding.UTF8.GetString(ea.Body.ToArray());
                var journeyEvent = JsonSerializer.Deserialize<UserJourneyTrackedEvent>(json);

                if (journeyEvent is null)
                {
                    _logger.LogWarning("Received null/invalid UserJourneyTrackedEvent payload.");
                    await _channel.BasicAckAsync(ea.DeliveryTag, multiple: false);
                    return;
                }

                var status = MapStatus(journeyEvent.Status);
                var sanitizedMetadata = PiiSanitizer.Sanitize(journeyEvent.MetadataJson);

                var log = UserJourneyLog.Create(
                    sessionId: journeyEvent.SessionId,
                    userId: journeyEvent.UserId,
                    processName: journeyEvent.ProcessName,
                    stepName: journeyEvent.StepName,
                    status: status,
                    failureReason: journeyEvent.FailureReason,
                    metadataJson: sanitizedMetadata);

                // هنا الفرق الأساسي: مش بنعمل Ack، بنحط الرسالة في الـ buffer وبس
                await _buffer.Writer.WriteAsync(new BufferedJourneyMessage(log, ea.DeliveryTag), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to prepare UserJourneyTrackedEvent message for batching.");
                await _channel.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: false);
            }
        };

        await _channel.BasicConsumeAsync(
            queue: _options.QueueName,
            autoAck: false,
            consumer: consumer,
            cancellationToken: stoppingToken);

        // اللوب دا هو المسؤول عن التجميع والفلاش، وبيفضل شغال طول عمر السيرفس
        await RunBatchFlushLoopAsync(stoppingToken);
    }

    private async Task RunBatchFlushLoopAsync(CancellationToken stoppingToken)
    {
        var batch = new List<BufferedJourneyMessage>(_batchOptions.BatchSize);

        while (!stoppingToken.IsCancellationRequested)
        {
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
            timeoutCts.CancelAfter(_batchOptions.FlushIntervalMs);

            try
            {
                // بنفضل نقرا لحد ما نوصل BatchSize، أو لحد ما الـ timeout يصرخ
                while (batch.Count < _batchOptions.BatchSize &&
                       await _buffer.Reader.WaitToReadAsync(timeoutCts.Token))
                {
                    while (batch.Count < _batchOptions.BatchSize && _buffer.Reader.TryRead(out var msg))
                    {
                        batch.Add(msg);
                    }
                }
            }
            catch (OperationCanceledException) when (!stoppingToken.IsCancellationRequested)
            {
                // FlushInterval خلص من غير ما نوصل BatchSize - عادي، هنفلش اللي عندنا
            }

            if (batch.Count > 0)
            {
                await FlushBatchAsync(batch, stoppingToken);
                batch.Clear();
            }
        }
    }

    private async Task FlushBatchAsync(List<BufferedJourneyMessage> batch, CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IUserJourneyLogRepository>();

        try
        {
            var logs = batch.Select(b => b.Log).ToList();
            await repository.AddRangeAsync(logs, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            // multiple: true = يعمل Ack لكل الرسائل اللي DeliveryTag بتاعها <= آخر تاج في الباتش
            var lastTag = batch[^1].DeliveryTag;
            await _channel!.BasicAckAsync(lastTag, multiple: true, cancellationToken: cancellationToken);
        }
        catch (Exception ex)
        {
            // Resilience: فشل الحفظ الجماعي - منرجعش الرسائل تضيع، بنعمل Nack جماعي بدون requeue
            _logger.LogError(ex, "Failed to flush batch of {Count} audit logs.", batch.Count);

            var lastTag = batch[^1].DeliveryTag;
            await _channel!.BasicNackAsync(lastTag, multiple: true, requeue: false, cancellationToken: cancellationToken);
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        if (_channel is not null) await _channel.CloseAsync(cancellationToken);
        if (_connection is not null) await _connection.CloseAsync(cancellationToken);
        await base.StopAsync(cancellationToken);
    }

    public override void Dispose()
    {
        _channel?.Dispose();
        _connection?.Dispose();
        base.Dispose();
    }

    private static AuditStatus MapStatus(string status)
    {
        return status.Trim().ToUpperInvariant() switch
        {
            "SUCCESS" => AuditStatus.Success,
            "FAILED" => AuditStatus.Failed,
            _ => throw new ArgumentOutOfRangeException(nameof(status), status, "Unknown audit status value.")
        };
    }

    private sealed record BufferedJourneyMessage(UserJourneyLog Log, ulong DeliveryTag);
}