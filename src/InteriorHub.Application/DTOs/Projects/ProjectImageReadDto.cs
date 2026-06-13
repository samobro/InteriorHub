namespace InteriorHub.Application.DTOs.Projects;

public sealed class ProjectImageReadDto
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}
