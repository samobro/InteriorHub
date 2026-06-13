using InteriorHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteriorHub.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/projects")]
public sealed class AdminProjectsController(IProjectService projectService) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        // TODO: Add real admin authentication/authorization wiring.
        return Ok(await projectService.GetAllAdminAsync(pageNumber, pageSize, cancellationToken));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken = default)
    {
        // TODO: Add real admin authentication/authorization wiring.
        await projectService.DeleteAdminAsync(id, cancellationToken);
        return NoContent();
    }
}
