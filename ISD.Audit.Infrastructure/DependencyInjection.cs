using ISD.Aduit.Infrastructure.Persistence;
using ISD.Audit.Infrastructure.Messaging;
using ISD.Audit.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ISD.Audit.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddAuditModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = ResolveConnectionString(configuration);

        services.AddDbContextPool<AuditDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IUserJourneyLogRepository, UserJourneyLogRepository>();
        services.Configure<RabbitMqOptions>(configuration.GetSection(RabbitMqOptions.SectionName));
        services.Configure<AuditBatchOptions>(configuration.GetSection(AuditBatchOptions.SectionName));
        services.AddHostedService<UserJourneyConsumer>();
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