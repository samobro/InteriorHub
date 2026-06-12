using InteriorHub.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InteriorHub.API.Controllers;

[ApiController]
[Route("api/engineers")]
public sealed class EngineersController(IEngineerService engineerService) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetApproved([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
        => Ok(await engineerService.GetApprovedAsync(pageNumber, pageSize, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken = default)
        => Ok(await engineerService.GetPublicByIdAsync(id, cancellationToken));
}
