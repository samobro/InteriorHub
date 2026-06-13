namespace InteriorHub.Application.DTOs.ContactRequests;

public sealed class ContactRequestCreateDto
{
    public int EngineerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
