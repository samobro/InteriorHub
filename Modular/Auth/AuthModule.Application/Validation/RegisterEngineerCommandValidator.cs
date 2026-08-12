using AuthModule.Application.Commands;
using FluentValidation;

namespace AuthModule.Application.Validation;

public sealed class RegisterEngineerCommandValidator : AbstractValidator<RegisterEngineerCommand>
{
    public RegisterEngineerCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(200);
        RuleFor(x => x.City).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Bio).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.Specialization).NotEmpty().MaximumLength(200);
    }
}
