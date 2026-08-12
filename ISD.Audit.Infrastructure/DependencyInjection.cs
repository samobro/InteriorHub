using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ISD.Audit.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddAuditModule(this IServiceCollection services, string connectionString)
    {
        services.AddDbContextPool<AuditDbContext>(options =>
            options.UseSqlServer(connectionString));


        return services;
    }
}