using FluentValidation;
using InteriorHub.Application.DTOs.Engineers;

namespace InteriorHub.Application.Validation.Engineers;

public sealed class EngineerTrialUpdateDtoValidator : AbstractValidator<EngineerTrialUpdateDto>
{
    public EngineerTrialUpdateDtoValidator()
    {
        RuleFor(x => x.TrialEndsAt).NotEmpty();
    }
}
