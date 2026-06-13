namespace InteriorHub.Application.DTOs.Engineers;

public sealed class EngineerUpdateDto
{
    public string FullName { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public string City { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool IsTrialActive { get; set; }
    public DateTime? TrialEndsAt { get; set; }
}
