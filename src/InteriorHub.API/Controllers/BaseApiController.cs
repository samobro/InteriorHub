using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace InteriorHub.API.Controllers;

[ApiController]
public abstract class BaseApiController : ControllerBase
{
    protected int GetCurrentEngineerId()
    {
        var rawId =
            User.FindFirstValue("EngineerId") ??
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("sub");

        if (int.TryParse(rawId, out var engineerId))
        {
            return engineerId;
        }

        throw new UnauthorizedAccessException("EngineerId claim is missing. TODO: wire real authentication and claims.");
    }
}
