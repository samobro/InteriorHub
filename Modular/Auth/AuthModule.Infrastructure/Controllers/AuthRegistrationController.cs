using AuthModule.Application.Commands;
using AuthModule.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuthModule.Infrastructure.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthRegistrationController(IAuthRegistrationService authRegistrationService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterEngineerCommand command, CancellationToken cancellationToken)
    {
        await authRegistrationService.RegisterEngineerAsync(command, cancellationToken);

        return Ok(new
        {
            message = "Registration submitted successfully. You can now sign in."
        });
    }
}
