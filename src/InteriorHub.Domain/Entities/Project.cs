namespace InteriorHub.Domain.Entities;

public class Project
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int EngineerId { get; set; }
    public DateTime CreatedAt { get; set; }

    public Category? Category { get; set; }
    public Engineer? Engineer { get; set; }
    public ICollection<ProjectImage> ProjectImages { get; set; } = new List<ProjectImage>();
}
