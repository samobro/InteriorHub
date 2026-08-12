using InteriorHub.Application.Interfaces;
using InteriorHub.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace InteriorHub.API.Controllers;

public sealed record LoginRequest(string Email, string Password);
public sealed record AuthResponse(string Token, AuthUser User);
public sealed record AuthUser(int Id, string Name, string Email, string Role);

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IUnitOfWork unitOfWork) : ControllerBase
{
    private const string JwtSecret = "InteriorHub_dev_jwt_secret_key_please_replace_in_production_12345";

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var engineer = await unitOfWork.Engineers.Query()
            .FirstOrDefaultAsync(x => x.Email == request.Email, cancellationToken);

        if (engineer is null || !BCrypt.Net.BCrypt.Verify(request.Password, engineer.PasswordHash))
        {
            return Unauthorized(new { error = "Invalid email or password." });
        }

        var user = new AuthUser(engineer.Id, engineer.FullName, engineer.Email, engineer.Role);
        return Ok(new AuthResponse(CreateJwtToken(user.Id, user.Email, user.Name, user.Role), user));
    }

    private static string CreateJwtToken(int engineerId, string email, string name, string role)
    {
        var claims = new[]
        {
            new Claim("EngineerId", engineerId.ToString()),
            new Claim(ClaimTypes.NameIdentifier, engineerId.ToString()),
            new Claim(ClaimTypes.Name, name),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "InteriorHub",
            audience: "InteriorHub",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
