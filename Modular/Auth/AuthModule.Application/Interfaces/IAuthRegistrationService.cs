using AuthModule.Application.Commands;

namespace AuthModule.Application.Interfaces;

public interface IAuthRegistrationService
{
    Task RegisterEngineerAsync(RegisterEngineerCommand command, CancellationToken cancellationToken = default);
}
