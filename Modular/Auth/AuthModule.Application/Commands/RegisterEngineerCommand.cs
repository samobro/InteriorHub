namespace AuthModule.Application.Commands;

public sealed record RegisterEngineerCommand(
    string Name,
    string Email,
    string Password,
    string City,
    string Bio,
    string Specialization);
