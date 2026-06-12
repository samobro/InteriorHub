namespace InteriorHub.Application.DTOs.Projects;

public sealed class ProjectImageCreateDto
{
    public string ImageUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}
