using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using AuthModule.Application.Commands;
using AuthModule.Application.Interfaces;
using AuthModule.Application.Validation;
using AuthModule.Infrastructure.Security;
using AuthModule.Infrastructure.Services;
using OpenIddict.Server;
using FluentValidation;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace AuthModule.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddAuthModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = ResolveConnectionString(configuration);

        services.AddDbContextPool<AuthDbContext>(options =>
        {
            options.UseSqlServer(connectionString);
            options.UseOpenIddict();
        });

        services.AddScoped<IAuthRegistrationService, AuthRegistrationService>();
        services.AddScoped<IValidator<RegisterEngineerCommand>, RegisterEngineerCommandValidator>();
        services.AddScoped<PasswordGrantTokenRequestHandler>();

        services.AddOpenIddict()
            .AddCore(options =>
            {
                options.UseEntityFrameworkCore()
                    .UseDbContext<AuthDbContext>();
            })
            .AddServer(options =>
            {
                options.SetTokenEndpointUris("/connect/token");
                options.SetRevocationEndpointUris("/connect/revoke");
                options.AllowPasswordFlow();
                options.AllowRefreshTokenFlow();
                options.RegisterScopes(Scopes.OfflineAccess);
                options.AcceptAnonymousClients();
                options.SetAccessTokenLifetime(TimeSpan.FromMinutes(15));
                options.SetRefreshTokenLifetime(TimeSpan.FromDays(14));
                options.AddDevelopmentEncryptionCertificate();
                options.AddDevelopmentSigningCertificate();
                options.AddEventHandler<OpenIddictServerEvents.HandleTokenRequestContext>(builder =>
                {
                    builder.UseScopedHandler<PasswordGrantTokenRequestHandler>();
                });

                options.UseAspNetCore();
            })
            .AddValidation(options =>
            {
                options.UseLocalServer();
                options.UseAspNetCore();
            });

        return services;
    }

    private static string ResolveConnectionString(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(connectionString))
        {
            return connectionString;
        }

        throw new InvalidOperationException("No database connection string was configured. Set ConnectionStrings:DefaultConnection.");
    }
}
