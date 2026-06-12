using AutoMapper;
using FluentValidation;
using InteriorHub.Application.Interfaces;
using InteriorHub.Application.Mapping;
using InteriorHub.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace InteriorHub.Application;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(_ => { }, typeof(InteriorHubProfile).Assembly);
        services.AddValidatorsFromAssembly(typeof(InteriorHubProfile).Assembly);

        services.AddScoped<IEngineerService, EngineerService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProjectService, ProjectService>();
        services.AddScoped<IContactRequestService, ContactRequestService>();

        return services;
    }
}
