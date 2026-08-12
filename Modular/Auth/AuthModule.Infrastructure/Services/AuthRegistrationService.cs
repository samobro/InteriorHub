using AuthModule.Application.Commands;
using AuthModule.Application.Interfaces;
using AuthModule.Domain.Entities;
using AuthModule.Infrastructure.Persistence;
using FluentValidation;
using InteriorHub.Application.Common.Exceptions;
using InteriorHub.Domain.Entities;
using InteriorHub.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Transactions;

namespace AuthModule.Infrastructure.Services;

public sealed class AuthRegistrationService(
    InteriorHubDbContext interiorHubDbContext,
    AuthDbContext authDbContext,
    IValidator<RegisterEngineerCommand> validator) : IAuthRegistrationService
{
    public async Task RegisterEngineerAsync(RegisterEngineerCommand command, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAndThrowAsync(command, cancellationToken);

        var emailExists = await interiorHubDbContext.Engineers
            .AnyAsync(x => x.Email == command.Email, cancellationToken);

        if (emailExists)
        {
            throw new ConflictException("An account with this email already exists.");
        }

        using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

        var engineer = new Engineer
        {
            FullName = command.Name,
            Email = command.Email,
            City = command.City,
            Bio = command.Bio,
            Specialization = command.Specialization,
            Role = "Engineer",
            Status = EngineerStatus.Pending,
            IsApproved = false,
            CreatedAt = DateTime.UtcNow
        };

        await interiorHubDbContext.Engineers.AddAsync(engineer, cancellationToken);
        await interiorHubDbContext.SaveChangesAsync(cancellationToken);

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(command.Password);
        var authUser = AuthUser.Create(engineer.Id, passwordHash);

        await authDbContext.AuthUsers.AddAsync(authUser, cancellationToken);
        await authDbContext.SaveChangesAsync(cancellationToken);

        scope.Complete();
    }
}
