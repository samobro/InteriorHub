namespace ISD.Audit.Infrastructure.Messaging;

public sealed class AuditBatchOptions
{
    public const string SectionName = "AuditBatch";
    public int BatchSize { get; init; } = 50;
    public int FlushIntervalMs { get; init; } = 2000;
}