using InteriorHub.Domain.Entities;

namespace InteriorHub.Application.DTOs.Projects;

public sealed class ProjectAdminReadDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string EngineerName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
