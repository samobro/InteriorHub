using AutoMapper;
using FluentValidation;
using InteriorHub.Application.Common.Exceptions;
using InteriorHub.Application.DTOs.Categories;
using InteriorHub.Application.Interfaces;
using InteriorHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InteriorHub.Application.Services;

public sealed class CategoryService(
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IValidator<CategoryCreateDto> createValidator,
    IValidator<CategoryUpdateDto> updateValidator) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryReadDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var categories = await unitOfWork.Categories
            .Query()
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return mapper.Map<IReadOnlyList<CategoryReadDto>>(categories);
    }

    public async Task<CategoryReadDto> CreateAsync(CategoryCreateDto dto, CancellationToken cancellationToken = default)
    {
        await createValidator.ValidateAndThrowAsync(dto, cancellationToken);

        var existingSlug = await unitOfWork.Categories.Query()
            .AnyAsync(x => x.Slug == dto.Slug, cancellationToken);

        if (existingSlug)
        {
            throw new ConflictException($"Category slug '{dto.Slug}' already exists.");
        }

        var category = mapper.Map<Category>(dto);
        await unitOfWork.Categories.AddAsync(category);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return mapper.Map<CategoryReadDto>(category);
    }

    public async Task<CategoryReadDto> UpdateAsync(int id, CategoryUpdateDto dto, CancellationToken cancellationToken = default)
    {
        await updateValidator.ValidateAndThrowAsync(dto, cancellationToken);

        var category = await unitOfWork.Categories.GetByIdAsync(id)
            ?? throw new NotFoundException($"Category {id} was not found.");

        var slugExists = await unitOfWork.Categories.Query()
            .AnyAsync(x => x.Id != id && x.Slug == dto.Slug, cancellationToken);

        if (slugExists)
        {
            throw new ConflictException($"Category slug '{dto.Slug}' already exists.");
        }

        mapper.Map(dto, category);
        unitOfWork.Categories.Update(category);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return mapper.Map<CategoryReadDto>(category);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await unitOfWork.Categories.GetByIdAsync(id)
            ?? throw new NotFoundException($"Category {id} was not found.");

        var hasProjects = await unitOfWork.Projects.Query()
            .AnyAsync(x => x.CategoryId == id, cancellationToken);

        if (hasProjects)
        {
            throw new ConflictException("This category cannot be deleted because it has linked projects.");
        }

        unitOfWork.Categories.Remove(category);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
