using InteriorHub.Application.DTOs.Engineers;
using InteriorHub.Application.DTOs.Projects;
using InteriorHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteriorHub.API.Controllers;

[ApiController]
[Authorize]
[Route("api/engineer")]
public sealed class EngineerController(
    IEngineerService engineerService,
    IProjectService projectService) : BaseApiController
{
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken = default)
        => Ok(await engineerService.GetMyProfileAsync(GetCurrentEngineerId(), cancellationToken));

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] EngineerUpdateDto dto, CancellationToken cancellationToken = default)
        => Ok(await engineerService.UpdateMyProfileAsync(GetCurrentEngineerId(), dto, cancellationToken));

    [HttpGet("projects")]
    public async Task<IActionResult> GetProjects([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
        => Ok(await projectService.GetMyProjectsAsync(GetCurrentEngineerId(), pageNumber, pageSize, cancellationToken));

    [HttpPost("projects")]
    public async Task<IActionResult> CreateProject([FromBody] ProjectCreateDto dto, CancellationToken cancellationToken = default)
        => Ok(await projectService.CreateAsync(GetCurrentEngineerId(), dto, cancellationToken));

    [HttpPut("projects/{id:int}")]
    public async Task<IActionResult> UpdateProject([FromRoute] int id, [FromBody] ProjectUpdateDto dto, CancellationToken cancellationToken = default)
        => Ok(await projectService.UpdateAsync(GetCurrentEngineerId(), id, dto, cancellationToken));

    [HttpDelete("projects/{id:int}")]
    public async Task<IActionResult> DeleteProject([FromRoute] int id, CancellationToken cancellationToken = default)
    {
        await projectService.DeleteAsync(GetCurrentEngineerId(), id, cancellationToken);
        return NoContent();
    }
}
