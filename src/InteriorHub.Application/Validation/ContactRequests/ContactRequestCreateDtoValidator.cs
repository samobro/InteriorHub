using FluentValidation;
using InteriorHub.Application.DTOs.ContactRequests;

namespace InteriorHub.Application.Validation.ContactRequests;

public sealed class ContactRequestCreateDtoValidator : AbstractValidator<ContactRequestCreateDto>
{
    public ContactRequestCreateDtoValidator()
    {
        RuleFor(x => x.EngineerId).GreaterThan(0);
        RuleFor(x => x.CustomerName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CustomerEmail).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.CustomerPhone).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(4000);
    }
}
