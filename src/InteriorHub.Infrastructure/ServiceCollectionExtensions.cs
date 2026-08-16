using InteriorHub.Application.Interfaces;
using InteriorHub.Infrastructure.Persistence;
using InteriorHub.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace InteriorHub.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<InteriorHubDbContext>(options =>
        {
            var connectionString = ResolveConnectionString(configuration);
            options.UseSqlServer(connectionString);
        });

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddSingleton<ICloudinaryService, CloudinaryService>();

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
