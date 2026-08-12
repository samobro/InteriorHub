using Microsoft.Extensions.Configuration;
using Npgsql;

public static class DbConnection
{
    public static string GetConnectionString => ResolveConnectionString();

    private static string ResolveConnectionString()
    {
        var configuration = BuildConfiguration();

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

        throw new InvalidOperationException("No database connection string was found. Set DATABASE_URL or ConnectionStrings:DefaultConnection in the API appsettings.");
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

        return builder.ConnectionString;
    }
}
