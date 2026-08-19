using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ISD.Audit.Domain.Models;

public enum AuditStatus
{
    Success,
    Failed
}

public class UserJourneyLog
{
    public int LogId { get; private set; }
    public Guid? SessionId { get; private set; }
    public string? UserId { get; private set; }
    public string ProcessName { get; private set; } = default!;
    public string StepName { get; private set; } = default!;
    public AuditStatus Status { get; private set; } = default!;
    public string? FailureReason { get; private set; }
    public string? MetadataJson { get; private set; }
    public DateTime CreatedAt { get; private set; }





    private UserJourneyLog() { }

    public static UserJourneyLog Create(
        Guid? sessionId,
        string? userId,
        string processName,
        string stepName,
        AuditStatus status,
        string? failureReason = null ,
        string? metadataJson = null)
    {

            if (string.IsNullOrWhiteSpace(processName))
                throw new ArgumentException("ProcessName is required.", nameof(processName));

            if (string.IsNullOrWhiteSpace(stepName))
                throw new ArgumentException("StepName is required.", nameof(stepName));

            if (status == AuditStatus.Failed && string.IsNullOrWhiteSpace(failureReason))
                throw new ArgumentException("FailureReason is required when status is Failed.", nameof(failureReason));
            return new UserJourneyLog
        {
            SessionId = sessionId ,
            UserId = userId ,
            ProcessName = processName ,
            StepName = stepName ,
            Status = status ,
            FailureReason = failureReason ,
            MetadataJson = metadataJson,
            CreatedAt = DateTime.UtcNow

        };
    }

}


