using FluentValidation;
using InteriorHub.Application.DTOs.Categories;

namespace InteriorHub.Application.Validation.Categories;

public sealed class CategoryCreateDtoValidator : AbstractValidator<CategoryCreateDto>
{
    public CategoryCreateDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(150);
    }
}
