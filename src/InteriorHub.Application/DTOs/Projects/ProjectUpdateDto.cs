namespace InteriorHub.Application.DTOs.Projects;

public sealed class ProjectUpdateDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string? ImageUrl { get; set; }
}
