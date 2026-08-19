using InteriorHub.Application;
using InteriorHub.Infrastructure;
using InteriorHub.Infrastructure.Persistence;
using InteriorHub.Domain.Entities;
using InteriorHub.API.Middleware;
using ISD.Audit.Infrastructure;
using AuthModule.Infrastructure;
using AuthModule.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Validation.AspNetCore;
using System.Text.Json.Serialization;
using System.Data.Common;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port) && int.TryParse(port, out var parsedPort))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{parsedPort}");
}

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme);
builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        // Restrict this to the frontend domain before production launch.
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddAuthModule(builder.Configuration);
builder.Services.AddAuditModule(builder.Configuration);

var app = builder.Build();

var adminEmail = builder.Configuration["AdminSeed:Email"];
var adminPassword = builder.Configuration["AdminSeed:Password"];

// ── Admin seed on startup ──────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<InteriorHubDbContext>();
    var authDb = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
    await db.Database.MigrateAsync();

    if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
    {
        app.Logger.LogWarning("Admin seed skipped: AdminSeed:Email and AdminSeed:Password must be set in configuration/user-secrets.");
    }
    else
    {
        var hasAdmin = await db.Engineers.AnyAsync(e => e.Role == "Admin");
        if (!hasAdmin)
        {
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword);
            var engineer = new Engineer
            {
                FullName = "Admin",
                Email = adminEmail,
                PasswordHash = passwordHash,
                City = "System",
                Bio = "Platform administrator",
                Specialization = "Administration",
                Role = "Admin",
                Status = EngineerStatus.Active,
                IsApproved = true,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                db.Engineers.Add(engineer);
                await db.SaveChangesAsync();

                authDb.AuthUsers.Add(AuthUser.Create(engineer.Id, passwordHash));
                await authDb.SaveChangesAsync();

                app.Logger.LogInformation("Default admin account seeded: {AdminEmail}", adminEmail);
            }
            catch (Exception exception)
            {
                app.Logger.LogError(exception, "Admin seed failed after creating the Engineer/AuthUser records.");
                throw;
            }
        }
    }
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
