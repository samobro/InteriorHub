using InteriorHub.Application.Common;
using InteriorHub.Application.DTOs.Engineers;
using InteriorHub.Domain.Entities;
using InteriorHub.Application.DTOs.Projects;

namespace InteriorHub.Application.Interfaces;

public interface IEngineerService
{
    Task<PagedResult<EngineerReadDto>> GetApprovedAsync(int pageNumber, int pageSize, string? city = null, CancellationToken cancellationToken = default);
    Task<EngineerReadDto> GetPublicByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<EngineerProfileDto> GetMyProfileAsync(int engineerId, CancellationToken cancellationToken = default);
    Task<EngineerProfileDto> UpdateMyProfileAsync(int engineerId, EngineerUpdateDto dto, CancellationToken cancellationToken = default);
    Task<PagedResult<EngineerAdminReadDto>> GetAllAsync(EngineerStatus? status, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<PagedResult<ProjectReadDto>> GetProjectsAsync(int engineerId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task ApproveAsync(int id, CancellationToken cancellationToken = default);
    Task RejectAsync(int id, CancellationToken cancellationToken = default);
    Task DisableAsync(int id, CancellationToken cancellationToken = default);
    Task EnableAsync(int id, CancellationToken cancellationToken = default);
    Task UpdateTrialAsync(int id, EngineerTrialUpdateDto dto, CancellationToken cancellationToken = default);
}
