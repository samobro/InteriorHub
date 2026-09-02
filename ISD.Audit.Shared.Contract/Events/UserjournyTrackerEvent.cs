namespace ISD.Audit.Shared.Contract.Events; 

/// <summary> /// ///
/// العقد الثابت (Contract) بين أي موديول مرسل وموديول الـ Audit. ///
/// أي تعديل هنا بيأثر على كل الموديولات اللي بتستخدمه، فيتغير بحذر شديد. ///
/// </summary>/// 

public sealed class UserJourneyTrackedEvent
{
    public Guid? SessionId { get; init; } 
    public string? UserId { get; init; } 
    public string ProcessName { get; init; } = default!;
    public string StepName { get; init; } = default!; 
    public string Status { get; init; } = default!;
    public string? FailureReason { get; init; } 
    public string? MetadataJson { get; init; }
    public DateTime OccurredAtUtc { get; init; } = DateTime.UtcNow; 
}