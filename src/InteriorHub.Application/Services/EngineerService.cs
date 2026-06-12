using AutoMapper;
using FluentValidation;
using InteriorHub.Application.Common;
using InteriorHub.Application.Common.Exceptions;
using InteriorHub.Application.DTOs.Engineers;
using InteriorHub.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteriorHub.Application.Services;

public sealed class EngineerService(
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IValidator<EngineerUpdateDto> updateValidator) : IEngineerService
{
    public async Task<PagedResult<EngineerReadDto>> GetApprovedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = unitOfWork.Engineers.Query()
            .Where(x => x.IsApproved)
            .OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<EngineerReadDto>
        {
            Items = mapper.Map<IReadOnlyList<EngineerReadDto>>(items),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<EngineerReadDto> GetPublicByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var engineer = await unitOfWork.Engineers.Query()
            .Where(x => x.IsApproved && x.Id == id)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException($"Engineer {id} was not found.");

        return mapper.Map<EngineerReadDto>(engineer);
    }

    public async Task<EngineerProfileDto> GetMyProfileAsync(int engineerId, CancellationToken cancellationToken = default)
    {
        var engineer = await unitOfWork.Engineers.GetByIdAsync(engineerId)
            ?? throw new NotFoundException($"Engineer {engineerId} was not found.");

        return mapper.Map<EngineerProfileDto>(engineer);
    }

    public async Task<EngineerProfileDto> UpdateMyProfileAsync(int engineerId, EngineerUpdateDto dto, CancellationToken cancellationToken = default)
    {
        await updateValidator.ValidateAndThrowAsync(dto, cancellationToken);

        var engineer = await unitOfWork.Engineers.GetByIdAsync(engineerId)
            ?? throw new NotFoundException($"Engineer {engineerId} was not found.");

        mapper.Map(dto, engineer);
        unitOfWork.Engineers.Update(engineer);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return mapper.Map<EngineerProfileDto>(engineer);
    }

    public async Task<PagedResult<EngineerAdminReadDto>> GetAllAsync(bool? isApproved, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        IQueryable<InteriorHub.Domain.Entities.Engineer> query = unitOfWork.Engineers.Query();

        if (isApproved.HasValue)
        {
            query = query.Where(x => x.IsApproved == isApproved.Value);
        }

        query = query.OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<EngineerAdminReadDto>
        {
            Items = mapper.Map<IReadOnlyList<EngineerAdminReadDto>>(items),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task ApproveAsync(int id, CancellationToken cancellationToken = default)
    {
        var engineer = await unitOfWork.Engineers.GetByIdAsync(id)
            ?? throw new NotFoundException($"Engineer {id} was not found.");

        engineer.IsApproved = true;
        unitOfWork.Engineers.Update(engineer);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task DisableAsync(int id, CancellationToken cancellationToken = default)
    {
        var engineer = await unitOfWork.Engineers.GetByIdAsync(id)
            ?? throw new NotFoundException($"Engineer {id} was not found.");

        engineer.IsApproved = false;
        unitOfWork.Engineers.Update(engineer);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
