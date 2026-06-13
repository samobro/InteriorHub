using FluentValidation;
using InteriorHub.Application.DTOs.Projects;

namespace InteriorHub.Application.Validation.Projects;

public sealed class ProjectCreateDtoValidator : AbstractValidator<ProjectCreateDto>
{
    public ProjectCreateDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.ImageUrl).MaximumLength(1000).When(x => !string.IsNullOrWhiteSpace(x.ImageUrl));
    }
}
