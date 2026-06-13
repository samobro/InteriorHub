using InteriorHub.Application.Common;
using InteriorHub.Application.DTOs.Projects;

namespace InteriorHub.Application.Interfaces;

public interface IProjectService
{
    Task<PagedResult<ProjectReadDto>> GetPublicAsync(int? categoryId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<ProjectDetailDto> GetPublicByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<PagedResult<ProjectReadDto>> GetPublicByEngineerAsync(int engineerId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<PagedResult<ProjectReadDto>> GetMyProjectsAsync(int engineerId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<PagedResult<ProjectAdminReadDto>> GetAllAdminAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<ProjectDetailDto> CreateAsync(int engineerId, ProjectCreateDto dto, CancellationToken cancellationToken = default);
    Task<ProjectDetailDto> UpdateAsync(int engineerId, int id, ProjectUpdateDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int engineerId, int id, CancellationToken cancellationToken = default);
    Task DeleteAdminAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProjectImageReadDto>> AddImagesAsync(int engineerId, int projectId, IReadOnlyCollection<ProjectImageCreateDto> images, CancellationToken cancellationToken = default);
    Task DeleteImageAsync(int engineerId, int projectId, int imageId, CancellationToken cancellationToken = default);
}
