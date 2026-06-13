using InteriorHub.Application.DTOs.Projects;
using InteriorHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteriorHub.API.Controllers;

[ApiController]
[Authorize]
[Route("api/me")]
public sealed class MeController(
    IEngineerService engineerService,
    IProjectService projectService,
    IContactRequestService contactRequestService) : BaseApiController
{
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken = default)
    {
        // TODO: Wire real auth and put EngineerId into claims.
        return Ok(await engineerService.GetMyProfileAsync(GetCurrentEngineerId(), cancellationToken));
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] InteriorHub.Application.DTOs.Engineers.EngineerUpdateDto dto, CancellationToken cancellationToken = default)
    {
        // TODO: Wire real auth and put EngineerId into claims.
        return Ok(await engineerService.UpdateMyProfileAsync(GetCurrentEngineerId(), dto, cancellationToken));
    }

    [HttpGet("projects")]
    public async Task<IActionResult> GetProjects([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
        => Ok(await projectService.GetMyProjectsAsync(GetCurrentEngineerId(), pageNumber, pageSize, cancellationToken));

    [HttpGet("projects/{id:int}")]
    public async Task<IActionResult> GetProjectById([FromRoute] int id, CancellationToken cancellationToken = default)
        => Ok(await projectService.GetMyProjectByIdAsync(GetCurrentEngineerId(), id, cancellationToken));


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

    [HttpPost("projects/{id:int}/images")]
    public async Task<IActionResult> AddProjectImages([FromRoute] int id, [FromBody] List<ProjectImageCreateDto> images, CancellationToken cancellationToken = default)
        => Ok(await projectService.AddImagesAsync(GetCurrentEngineerId(), id, images, cancellationToken));

    [HttpGet("projects/{id:int}/images")]
    public async Task<IActionResult> GetProjectImages([FromRoute] int id, CancellationToken cancellationToken = default)
        => Ok(await projectService.GetProjectImagesAsync(GetCurrentEngineerId(), id, cancellationToken));

    [HttpPut("projects/{id:int}/images/{imageId:int}/order")]
    public async Task<IActionResult> UpdateProjectImageOrder([FromRoute] int id, [FromRoute] int imageId, [FromQuery] int displayOrder, CancellationToken cancellationToken = default)
    {
        await projectService.UpdateImageDisplayOrderAsync(GetCurrentEngineerId(), id, imageId, displayOrder, cancellationToken);
        return NoContent();
    }

    [HttpDelete("projects/{id:int}/images/{imageId:int}")]
    public async Task<IActionResult> DeleteProjectImage([FromRoute] int id, [FromRoute] int imageId, CancellationToken cancellationToken = default)
    {
        await projectService.DeleteImageAsync(GetCurrentEngineerId(), id, imageId, cancellationToken);
        return NoContent();
    }

    [HttpGet("contact-requests")]
    public async Task<IActionResult> GetContactRequests([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
        => Ok(await contactRequestService.GetReceivedAsync(GetCurrentEngineerId(), pageNumber, pageSize, cancellationToken));
}
