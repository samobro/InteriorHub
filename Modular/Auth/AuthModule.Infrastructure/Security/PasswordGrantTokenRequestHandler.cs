using AuthModule.Infrastructure;
using AuthModule.Infrastructure.Persistence;
using AuthModule.Infrastructure.Security;
using InteriorHub.Application.Common.Exceptions;
using InteriorHub.Domain.Entities;
using InteriorHub.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Abstractions;
using OpenIddict.Server;
using System.Security.Claims;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace AuthModule.Infrastructure.Security;

public sealed class PasswordGrantTokenRequestHandler(
    InteriorHubDbContext interiorHubDbContext,
    AuthDbContext authDbContext) : IOpenIddictServerHandler<OpenIddictServerEvents.HandleTokenRequestContext>
{
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);
    private const int MaxFailedAttempts = 5;

    public async ValueTask HandleAsync(OpenIddictServerEvents.HandleTokenRequestContext context)
    {
        if (!string.Equals(context.Request.GrantType, GrantTypes.Password, StringComparison.Ordinal))
        {
            return;
        }

        var now = DateTime.UtcNow;
        var username = context.Request.Username?.Trim();
        var password = context.Request.Password;

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            RejectInvalidCredentials(context);
            return;
        }

        var engineer = await interiorHubDbContext.Engineers
            .FirstOrDefaultAsync(x => x.Email == username, context.CancellationToken);

        if (engineer is null)
        {
            RejectInvalidCredentials(context);
            return;
        }

        if (engineer.Status == EngineerStatus.Disabled)
        {
            context.Reject(
                error: Errors.InvalidGrant,
                description: "This account is disabled.",
                uri: null);
            return;
        }

        var authUser = await authDbContext.AuthUsers
            .FirstOrDefaultAsync(x => x.EngineerId == engineer.Id, context.CancellationToken);

        if (authUser is null)
        {
            RejectInvalidCredentials(context);
            return;
        }

        if (authUser.IsLockedOut(now))
        {
            context.Reject(
                error: Errors.InvalidGrant,
                description: "This account is temporarily locked. Please try again later.",
                uri: null);
            return;
        }

        if (!BCrypt.Net.BCrypt.Verify(password, authUser.PasswordHash))
        {
            authUser.RegisterFailedLoginAttempt(MaxFailedAttempts, LockoutDuration, now);
            await authDbContext.SaveChangesAsync(context.CancellationToken);

            RejectInvalidCredentials(context);
            return;
        }

        authUser.RegisterSuccessfulLogin(now);
        await authDbContext.SaveChangesAsync(context.CancellationToken);

        var principal = AuthPrincipalFactory.CreatePrincipal(engineer.Id, engineer.FullName, engineer.Email, engineer.Role);
        context.SignIn(principal);
        context.HandleRequest();
    }

    private static void RejectInvalidCredentials(OpenIddictServerEvents.HandleTokenRequestContext context)
    {
        context.Reject(
            error: Errors.InvalidGrant,
            description: "Invalid credentials.",
            uri: null);
    }
}
