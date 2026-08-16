using FluentValidation;
using InteriorHub.Application.DTOs.Categories;

namespace InteriorHub.Application.Validation.Categories;

public sealed class CategoryUpdateDtoValidator : AbstractValidator<CategoryUpdateDto>
{
    public CategoryUpdateDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(150);
        RuleFor(x => x.ImageUrl).MaximumLength(1000).When(x => !string.IsNullOrWhiteSpace(x.ImageUrl));
    }
}
