using InteriorHub.Application;
using InteriorHub.Infrastructure;
using InteriorHub.Infrastructure.Persistence;
using InteriorHub.Domain.Entities;
using InteriorHub.API.Middleware;
using ISD.Audit.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
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

var jwtSecret = "InteriorHub_dev_jwt_secret_key_please_replace_in_production_12345";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "InteriorHub",
            ValidAudience = "InteriorHub",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.FromMinutes(1),
            RoleClaimType = System.Security.Claims.ClaimTypes.Role
        };
    });
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
//builder.Services.AddAuditModule(DbConnection.GetConnectionString);

var app = builder.Build();

// ── Admin seed on startup ──────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<InteriorHubDbContext>();
    await db.Database.MigrateAsync();

    var hasAdmin = await db.Engineers.AnyAsync(e => e.Role == "Admin");
    if (!hasAdmin)
    {
        db.Engineers.Add(new Engineer
        {
            FullName = "Admin",
            Email = "admin@interiorhub.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            City = "System",
            Bio = "Platform administrator",
            Specialization = "Administration",
            Role = "Admin",
            Status = EngineerStatus.Active,
            IsApproved = true,
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();
        app.Logger.LogInformation("Default admin account seeded: admin@interiorhub.com");
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
