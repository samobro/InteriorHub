using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
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
            options.UseNpgsql(connectionString);
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

                options.UseAspNetCore()
                    .EnableTokenEndpointPassthrough();
            });

        return services;
    }

    private static string ResolveConnectionString(IConfiguration configuration)
    {
        var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
        if (!string.IsNullOrWhiteSpace(databaseUrl))
        {
            return BuildNpgsqlConnectionStringFromUrl(databaseUrl);
        }

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(connectionString))
        {
            return connectionString;
        }

        throw new InvalidOperationException("No database connection string was configured. Set DATABASE_URL or ConnectionStrings:DefaultConnection.");
    }

    private static string BuildNpgsqlConnectionStringFromUrl(string databaseUrl)
    {
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo;
        var separatorIndex = userInfo.IndexOf(':');
        var username = separatorIndex >= 0 ? userInfo[..separatorIndex] : userInfo;
        var password = separatorIndex >= 0 ? userInfo[(separatorIndex + 1)..] : string.Empty;

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = uri.AbsolutePath.Trim('/'),
            Username = Uri.UnescapeDataString(username),
            Password = Uri.UnescapeDataString(password),
            SslMode = SslMode.Require
        };

        if (!string.IsNullOrWhiteSpace(uri.Query))
        {
            var query = uri.Query.TrimStart('?')
                .Split('&', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            foreach (var pair in query)
            {
                var kv = pair.Split('=', 2);
                if (kv.Length != 2)
                {
                    continue;
                }

                if (kv[0].Equals("sslmode", StringComparison.OrdinalIgnoreCase) && kv[1].Equals("disable", StringComparison.OrdinalIgnoreCase))
                {
                    builder.SslMode = SslMode.Disable;
                }
            }
        }

        return builder.ConnectionString;
    }
}
