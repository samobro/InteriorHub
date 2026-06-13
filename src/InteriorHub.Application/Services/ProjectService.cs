using AutoMapper;
using FluentValidation;
using InteriorHub.Application.Common;
using InteriorHub.Application.Common.Exceptions;
using InteriorHub.Application.DTOs.Projects;
using InteriorHub.Application.Interfaces;
using InteriorHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InteriorHub.Application.Services;

public sealed class ProjectService(
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IValidator<ProjectCreateDto> createValidator,
    IValidator<ProjectUpdateDto> updateValidator,
    IValidator<ProjectImageCreateDto> imageValidator) : IProjectService
{
    public async Task<PagedResult<ProjectReadDto>> GetPublicAsync(int? categoryId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        IQueryable<Project> query = unitOfWork.Projects.Query()
            .Include(x => x.Category)
            .Include(x => x.Engineer)
            .Include(x => x.ProjectImages)
            .Where(x => x.Engineer != null && x.Engineer.Status == EngineerStatus.Active);

        if (categoryId.HasValue)
        {
            query = query.Where(x => x.CategoryId == categoryId.Value);
        }

        query = query.OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<ProjectReadDto>
        {
            Items = mapper.Map<IReadOnlyList<ProjectReadDto>>(items),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PagedResult<ProjectReadDto>> GetPublicByEngineerAsync(int engineerId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        IQueryable<Project> query = unitOfWork.Projects.Query()
            .Include(x => x.Category)
            .Include(x => x.Engineer)
            .Include(x => x.ProjectImages)
            .Where(x => x.EngineerId == engineerId && x.Engineer != null && x.Engineer.Status == EngineerStatus.Active)
            .OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<ProjectReadDto>
        {
            Items = mapper.Map<IReadOnlyList<ProjectReadDto>>(items),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<ProjectDetailDto> GetPublicByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var project = await unitOfWork.Projects.Query()
            .Include(x => x.Category)
            .Include(x => x.Engineer)
            .Include(x => x.ProjectImages.OrderBy(image => image.DisplayOrder))
            .FirstOrDefaultAsync(x => x.Id == id && x.Engineer != null && x.Engineer.Status == EngineerStatus.Active, cancellationToken)
            ?? throw new NotFoundException($"Project {id} was not found.");

        return mapper.Map<ProjectDetailDto>(project);
    }

    public async Task<PagedResult<ProjectReadDto>> GetMyProjectsAsync(int engineerId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = unitOfWork.Projects.Query()
            .Where(x => x.EngineerId == engineerId)
            .Include(x => x.Category)
            .Include(x => x.Engineer)
            .Include(x => x.ProjectImages)
            .OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<ProjectReadDto>
        {
            Items = mapper.Map<IReadOnlyList<ProjectReadDto>>(items),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PagedResult<ProjectAdminReadDto>> GetAllAdminAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = unitOfWork.Projects.Query()
            .Include(x => x.Category)
            .Include(x => x.Engineer)
            .OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<ProjectAdminReadDto>
        {
            Items = mapper.Map<IReadOnlyList<ProjectAdminReadDto>>(items),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<ProjectDetailDto> CreateAsync(int engineerId, ProjectCreateDto dto, CancellationToken cancellationToken = default)
    {
        await createValidator.ValidateAndThrowAsync(dto, cancellationToken);

        var engineer = await unitOfWork.Engineers.GetByIdAsync(engineerId)
            ?? throw new NotFoundException($"Engineer {engineerId} was not found.");

        var categoryExists = await unitOfWork.Categories.Query()
            .AnyAsync(x => x.Id == dto.CategoryId, cancellationToken);

        if (!categoryExists)
        {
            throw new NotFoundException($"Category {dto.CategoryId} was not found.");
        }

        var entity = mapper.Map<Project>(dto);
        entity.EngineerId = engineer.Id;
        entity.CreatedAt = DateTime.UtcNow;

        await unitOfWork.Projects.AddAsync(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(dto.ImageUrl))
        {
            await unitOfWork.ProjectImages.AddAsync(new ProjectImage
            {
                ProjectId = entity.Id,
                ImageUrl = dto.ImageUrl,
                DisplayOrder = 0
            });
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return await GetPublicByIdAsync(entity.Id, cancellationToken);
    }

    public async Task<ProjectDetailDto> UpdateAsync(int engineerId, int id, ProjectUpdateDto dto, CancellationToken cancellationToken = default)
    {
        await updateValidator.ValidateAndThrowAsync(dto, cancellationToken);

        var project = await unitOfWork.Projects.GetByIdAsync(id)
            ?? throw new NotFoundException($"Project {id} was not found.");

        if (project.EngineerId != engineerId)
        {
            throw new ForbiddenException("You can only update your own projects.");
        }

        var categoryExists = await unitOfWork.Categories.Query()
            .AnyAsync(x => x.Id == dto.CategoryId, cancellationToken);

        if (!categoryExists)
        {
            throw new NotFoundException($"Category {dto.CategoryId} was not found.");
        }

        mapper.Map(dto, project);
        unitOfWork.Projects.Update(project);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(dto.ImageUrl))
        {
            var existingImage = await unitOfWork.ProjectImages.Query()
                .Where(x => x.ProjectId == project.Id)
                .OrderBy(x => x.DisplayOrder)
                .FirstOrDefaultAsync(cancellationToken);

            if (existingImage is null)
            {
                await unitOfWork.ProjectImages.AddAsync(new ProjectImage
                {
                    ProjectId = project.Id,
                    ImageUrl = dto.ImageUrl,
                    DisplayOrder = 0
                });
            }
            else
            {
                existingImage.ImageUrl = dto.ImageUrl;
                unitOfWork.ProjectImages.Update(existingImage);
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return await GetPublicByIdAsync(project.Id, cancellationToken);
    }

    public async Task DeleteAsync(int engineerId, int id, CancellationToken cancellationToken = default)
    {
        var project = await unitOfWork.Projects.GetByIdAsync(id)
            ?? throw new NotFoundException($"Project {id} was not found.");

        if (project.EngineerId != engineerId)
        {
            throw new ForbiddenException("You can only delete your own projects.");
        }

        unitOfWork.Projects.Remove(project);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAdminAsync(int id, CancellationToken cancellationToken = default)
    {
        var project = await unitOfWork.Projects.GetByIdAsync(id)
            ?? throw new NotFoundException($"Project {id} was not found.");

        unitOfWork.Projects.Remove(project);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProjectImageReadDto>> AddImagesAsync(int engineerId, int projectId, IReadOnlyCollection<ProjectImageCreateDto> images, CancellationToken cancellationToken = default)
    {
        if (images.Count == 0)
        {
            return [];
        }

        var project = await unitOfWork.Projects.GetByIdAsync(projectId)
            ?? throw new NotFoundException($"Project {projectId} was not found.");

        if (project.EngineerId != engineerId)
        {
            throw new ForbiddenException("You can only modify your own projects.");
        }

        var entities = new List<ProjectImage>();
        foreach (var image in images)
        {
            await imageValidator.ValidateAndThrowAsync(image, cancellationToken);
            entities.Add(new ProjectImage
            {
                ProjectId = projectId,
                ImageUrl = image.ImageUrl,
                DisplayOrder = image.DisplayOrder
            });
        }

        await unitOfWork.ProjectImages.AddAsync(entities[0]);
        for (var i = 1; i < entities.Count; i++)
        {
            await unitOfWork.ProjectImages.AddAsync(entities[i]);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return mapper.Map<IReadOnlyList<ProjectImageReadDto>>(entities.OrderBy(x => x.DisplayOrder).ToList());
    }

    public async Task DeleteImageAsync(int engineerId, int projectId, int imageId, CancellationToken cancellationToken = default)
    {
        var project = await unitOfWork.Projects.Query()
            .Include(x => x.ProjectImages)
            .FirstOrDefaultAsync(x => x.Id == projectId, cancellationToken)
            ?? throw new NotFoundException($"Project {projectId} was not found.");

        if (project.EngineerId != engineerId)
        {
            throw new ForbiddenException("You can only modify your own projects.");
        }

        var image = project.ProjectImages.FirstOrDefault(x => x.Id == imageId)
            ?? throw new NotFoundException($"Project image {imageId} was not found.");

        unitOfWork.ProjectImages.Remove(image);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
