using InteriorHub.Application.Interfaces;
using InteriorHub.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace InteriorHub.API.Controllers;

[ApiController]
[Route("api/engineers")]
public sealed class EngineersController(IEngineerService engineerService) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetApproved([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? city = null, CancellationToken cancellationToken = default)
        => Ok(await engineerService.GetApprovedAsync(pageNumber, pageSize, city, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken = default)
        => Ok(await engineerService.GetPublicByIdAsync(id, cancellationToken));

    [HttpGet("{id:int}/projects")]
    public async Task<IActionResult> GetProjects([FromRoute] int id, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
        => Ok(await engineerService.GetProjectsAsync(id, pageNumber, pageSize, cancellationToken));
}
