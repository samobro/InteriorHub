using InteriorHub.Application.Common;
using InteriorHub.Application.DTOs.Engineers;

namespace InteriorHub.Application.Interfaces;

public interface IEngineerService
{
    Task<PagedResult<EngineerReadDto>> GetApprovedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<EngineerReadDto> GetPublicByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<EngineerProfileDto> GetMyProfileAsync(int engineerId, CancellationToken cancellationToken = default);
    Task<EngineerProfileDto> UpdateMyProfileAsync(int engineerId, EngineerUpdateDto dto, CancellationToken cancellationToken = default);
    Task<PagedResult<EngineerAdminReadDto>> GetAllAsync(bool? isApproved, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task ApproveAsync(int id, CancellationToken cancellationToken = default);
    Task DisableAsync(int id, CancellationToken cancellationToken = default);
}
