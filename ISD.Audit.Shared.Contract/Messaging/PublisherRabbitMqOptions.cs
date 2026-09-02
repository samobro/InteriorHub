namespace ISD.Audit.Shared.Contract.Messaging;
public sealed class PublisherRabbitMqOptions 
{ 
    public const string SectionName = "AuditRabbitMq";
    public string HostName { get; init; } = default!; 
    public string UserName { get; init; } = default!;
    public string Password { get; init; } = default!;
    public string QueueName { get; init; } = "audit.user-journey";
}