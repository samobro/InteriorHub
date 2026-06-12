using InteriorHub.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InteriorHub.API.Controllers;

[ApiController]
[Route("api/projects")]
public sealed class ProjectsController(IProjectService projectService) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetPublic([FromQuery] int? categoryId = null, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
        => Ok(await projectService.GetPublicAsync(categoryId, pageNumber, pageSize, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken = default)
        => Ok(await projectService.GetPublicByIdAsync(id, cancellationToken));
}
