using ISD.Audit.Shared.Contract.Abstractions;
using ISD.Audit.Shared.Contract.Events;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace ISD.Audit.Shared.Contract.Messaging;

public sealed class RabbitMqUserJourneyTracker : IUserJourneyTracker
{
    private readonly RabbitMqConnectionProvider _connectionProvider;
    private readonly PublisherRabbitMqOptions _options;
    private readonly ILogger<RabbitMqUserJourneyTracker> _logger;

    public RabbitMqUserJourneyTracker(RabbitMqConnectionProvider connectionProvider, IOptions<PublisherRabbitMqOptions> options, ILogger<RabbitMqUserJourneyTracker> logger)
    {
        _connectionProvider = connectionProvider;
        _options = options.Value;
        _logger = logger;
    }

    public async Task TrackAsync(UserJourneyTrackedEvent journeyEvent, CancellationToken cancellationToken = default)
    {
        try
        {
            var connection = await _connectionProvider.GetConnectionAsync(cancellationToken);
            using var channel = await connection.CreateChannelAsync(cancellationToken: cancellationToken);
            await channel.QueueDeclareAsync(_options.QueueName, durable: true, exclusive: false, autoDelete: false, cancellationToken: cancellationToken);
            var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(journeyEvent));
            await channel.BasicPublishAsync(string.Empty, _options.QueueName, mandatory: false, new BasicProperties { Persistent = true }, body, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish UserJourneyTrackedEvent for Session {SessionId}, Process {ProcessName}, Step {StepName}", journeyEvent.SessionId, journeyEvent.ProcessName, journeyEvent.StepName);
        }
    }
}
