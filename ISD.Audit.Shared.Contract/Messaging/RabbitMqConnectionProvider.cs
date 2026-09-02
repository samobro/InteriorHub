using RabbitMQ.Client;
using Microsoft.Extensions.Options;
using ISD.Audit.Shared.Contract.Messaging;
namespace ISD.Audit.Shared.Contract.Messaging;

// Singleton: نفتح Connection واحدة نشاركها، مش Connection جديدة كل مرة


 public sealed class RabbitMqConnectionProvider : IAsyncDisposable 
{
    private readonly PublisherRabbitMqOptions _options; 
    private IConnection? _connection; 
    private readonly SemaphoreSlim _lock = new(1, 1);
    
    public RabbitMqConnectionProvider(IOptions<PublisherRabbitMqOptions> options)
    {
        _options = options.Value; 
    }
    
    public async Task<IConnection> GetConnectionAsync(CancellationToken ct = default)
    {
        if (_connection is {IsOpen: true}) 
            return _connection;
        await _lock.WaitAsync(ct);
        try 
        {
            if (_connection is { IsOpen: true }) 
                return _connection; 
            
            var factory = new ConnectionFactory 
            {
                HostName = _options.HostName, 
                UserName = _options.UserName,
                Password = _options.Password 
            }; 
            
            _connection = await factory.CreateConnectionAsync(ct);
            return _connection;
        }
        
        finally
        { 
            _lock.Release();
        }
    }
    
    public async ValueTask DisposeAsync()
    { 
        if (_connection is not null)
            await _connection.DisposeAsync();
    } 
}
