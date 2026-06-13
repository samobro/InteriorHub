using FluentValidation;
using InteriorHub.Application.DTOs.Engineers;

namespace InteriorHub.Application.Validation.Engineers;

public sealed class EngineerUpdateDtoValidator : AbstractValidator<EngineerUpdateDto>
{
    public EngineerUpdateDtoValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Bio).NotEmpty();
        RuleFor(x => x.Specialization).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ProfileImageUrl).MaximumLength(1000).When(x => !string.IsNullOrWhiteSpace(x.ProfileImageUrl));
        RuleFor(x => x.City).NotEmpty().MaximumLength(120);
        RuleFor(x => x.PhoneNumber).MaximumLength(50).When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber));
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
    }
}
