namespace InteriorHub.Application.DTOs.Categories;

public sealed class CategoryUpdateDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}
