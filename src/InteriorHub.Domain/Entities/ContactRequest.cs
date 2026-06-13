namespace InteriorHub.Domain.Entities;

public class ContactRequest
{
    public int Id { get; set; }
    public int EngineerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }

    public Engineer? Engineer { get; set; }
}
