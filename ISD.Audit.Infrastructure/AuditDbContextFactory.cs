using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace ISD.Audit.Infrastructure;

public sealed class AuditDbContextFactory : IDesignTimeDbContextFactory<AuditDbContext>
{
    public AuditDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AuditDbContext>();
        optionsBuilder.UseSqlServer(ResolveConnectionString());
        return new AuditDbContext(optionsBuilder.Options);
    }

    private static string ResolveConnectionString()
    {
        var basePath = GetApiProjectDirectory();
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(connectionString))
        {
            return connectionString;
        }

        throw new InvalidOperationException(
            "No database connection string was found. Set ConnectionStrings:DefaultConnection in the API appsettings.");
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
