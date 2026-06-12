using AutoMapper;
using FluentValidation;
using InteriorHub.Application.Common;
using InteriorHub.Application.Common.Exceptions;
using InteriorHub.Application.DTOs.ContactRequests;
using InteriorHub.Application.Interfaces;
using InteriorHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InteriorHub.Application.Services;

public sealed class ContactRequestService(
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IValidator<ContactRequestCreateDto> createValidator) : IContactRequestService
{
    public async Task<ContactRequestReadDto> CreateAsync(ContactRequestCreateDto dto, CancellationToken cancellationToken = default)
    {
        await createValidator.ValidateAndThrowAsync(dto, cancellationToken);

        var engineerExists = await unitOfWork.Engineers.Query()
            .AnyAsync(x => x.Id == dto.EngineerId, cancellationToken);

        if (!engineerExists)
        {
            throw new NotFoundException($"Engineer {dto.EngineerId} was not found.");
        }

        var entity = mapper.Map<ContactRequest>(dto);
        entity.CreatedAt = DateTime.UtcNow;
        entity.IsRead = false;

        // TODO: Send email notification to the engineer once email integration is wired up.
        await unitOfWork.ContactRequests.AddAsync(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return mapper.Map<ContactRequestReadDto>(entity);
    }

    public async Task<PagedResult<ContactRequestReadDto>> GetReceivedAsync(int engineerId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = unitOfWork.ContactRequests.Query()
            .Where(x => x.EngineerId == engineerId)
            .OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<ContactRequestReadDto>
        {
            Items = mapper.Map<IReadOnlyList<ContactRequestReadDto>>(items),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }
}
