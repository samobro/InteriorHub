namespace InteriorHub.Application.DTOs.Projects;

public sealed class ProjectCreateDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
}
