using InteriorHub.Application.Common;
using InteriorHub.Application.DTOs.ContactRequests;

namespace InteriorHub.Application.Interfaces;

public interface IContactRequestService
{
    Task<ContactRequestReadDto> CreateAsync(ContactRequestCreateDto dto, CancellationToken cancellationToken = default);
    Task<PagedResult<ContactRequestReadDto>> GetReceivedAsync(int engineerId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
}
