namespace InteriorHub.Application.DTOs.Engineers;

public sealed class EngineerTrialUpdateDto
{
    public bool IsTrialActive { get; set; }
    public DateTime TrialEndsAt { get; set; }
}
