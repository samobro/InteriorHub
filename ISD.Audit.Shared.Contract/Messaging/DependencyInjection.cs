using ISD.Audit.Shared.Contract.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ISD.Audit.Shared.Contract.Messaging;

public static class DependencyInjection
{
    public static IServiceCollection AddUserJourneyTracking(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<PublisherRabbitMqOptions>(configuration.GetSection(PublisherRabbitMqOptions.SectionName));
        services.AddSingleton<RabbitMqConnectionProvider>();
        services.AddScoped<IUserJourneyTracker, RabbitMqUserJourneyTracker>();
        return services;
    }
}
