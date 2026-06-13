using InteriorHub.Application.Interfaces;
using InteriorHub.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace InteriorHub.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<InteriorHubDbContext>(options =>
        {
            var connectionString = ResolveConnectionString(configuration);
            options.UseNpgsql(connectionString);
        });

        services.AddScoped<IUnitOfWork, UnitOfWork>();

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
