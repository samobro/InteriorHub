using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace InteriorHub.Infrastructure.Persistence;

public sealed class InteriorHubDbContextFactory : IDesignTimeDbContextFactory<InteriorHubDbContext>
{
    public InteriorHubDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<InteriorHubDbContext>();
        optionsBuilder.UseSqlServer(ResolveConnectionString());
        return new InteriorHubDbContext(optionsBuilder.Options);
    }

    private static string ResolveConnectionString()
    {
        var configuration = BuildConfiguration();

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(connectionString))
        {
            return connectionString;
        }

        throw new InvalidOperationException(
            "No database connection string was found. Set ConnectionStrings:DefaultConnection in the API appsettings.");
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var basePath = GetApiProjectDirectory();

        return new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();
    }

    private static string GetApiProjectDirectory()
    {
        var currentDirectory = Directory.GetCurrentDirectory();
        var candidateDirectories = new[]
        {
            currentDirectory,
            Path.Combine(currentDirectory, "src", "InteriorHub.API"),
            Path.GetFullPath(Path.Combine(currentDirectory, "..", "src", "InteriorHub.API")),
            AppContext.BaseDirectory
        };

        foreach (var candidate in candidateDirectories)
        {
            if (File.Exists(Path.Combine(candidate, "appsettings.json")))
            {
                return candidate;
            }
        }

        throw new InvalidOperationException("Could not locate the InteriorHub.API project directory to load appsettings files.");
    }

}
