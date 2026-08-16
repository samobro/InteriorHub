namespace InteriorHub.Domain.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }

    public ICollection<Project> Projects { get; set; } = new List<Project>();
}
