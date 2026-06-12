namespace InteriorHub.Application.DTOs.Engineers;

public sealed class EngineerAdminReadDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public string City { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public bool IsTrialActive { get; set; }
    public DateTime? TrialEndsAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
