using InteriorHub.Application.DTOs.Categories;

namespace InteriorHub.Application.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryReadDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<CategoryReadDto> CreateAsync(CategoryCreateDto dto, CancellationToken cancellationToken = default);
    Task<CategoryReadDto> UpdateAsync(int id, CategoryUpdateDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
