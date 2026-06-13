using FluentValidation;
using InteriorHub.Application.DTOs.Projects;

namespace InteriorHub.Application.Validation.Projects;

public sealed class ProjectImageCreateDtoValidator : AbstractValidator<ProjectImageCreateDto>
{
    public ProjectImageCreateDtoValidator()
    {
        RuleFor(x => x.ImageUrl).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.DisplayOrder).GreaterThanOrEqualTo(0);
    }
}
