using InteriorHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteriorHub.API.Controllers;

[ApiController]
[Authorize]
[Route("api/admin/engineers")]
public sealed class AdminEngineersController(IEngineerService engineerService) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? isApproved = null, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        // TODO: Add real admin authentication/authorization wiring.
        return Ok(await engineerService.GetAllAsync(isApproved, pageNumber, pageSize, cancellationToken));
    }

    [HttpPut("{id:int}/approve")]
    public async Task<IActionResult> Approve([FromRoute] int id, CancellationToken cancellationToken = default)
    {
        // TODO: Add real admin authentication/authorization wiring.
        await engineerService.ApproveAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:int}/disable")]
    public async Task<IActionResult> Disable([FromRoute] int id, CancellationToken cancellationToken = default)
    {
        // TODO: Add real admin authentication/authorization wiring.
        await engineerService.DisableAsync(id, cancellationToken);
        return NoContent();
    }
}
