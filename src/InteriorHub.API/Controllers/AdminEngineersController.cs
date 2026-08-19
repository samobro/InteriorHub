using InteriorHub.Application.Interfaces;
using InteriorHub.Application.DTOs.Engineers;
using InteriorHub.Infrastructure.Persistence;
using InteriorHub.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteriorHub.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/engineers")]
public sealed class AdminEngineersController(
    IEngineerService engineerService,
    ICloudinaryService cloudinaryService,
    IUnitOfWork unitOfWork) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] EngineerStatus? status = null, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        // TODO: Add real admin authentication/authorization wiring.
        return Ok(await engineerService.GetAllAsync(status, pageNumber, pageSize, cancellationToken));
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

    [HttpPut("{id:int}/reject")]
    public async Task<IActionResult> Reject([FromRoute] int id, CancellationToken cancellationToken = default)
    {
        // TODO: Add real admin authentication/authorization wiring.
        await engineerService.RejectAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:int}/enable")]
    public async Task<IActionResult> Enable([FromRoute] int id, CancellationToken cancellationToken = default)
    {
        // TODO: Add real admin authentication/authorization wiring.
        await engineerService.EnableAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:int}/trial")]
    public async Task<IActionResult> UpdateTrial([FromRoute] int id, [FromBody] EngineerTrialUpdateDto dto, CancellationToken cancellationToken = default)
    {
        await engineerService.UpdateTrialAsync(id, dto, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:int}/profile-image")]
    public async Task<IActionResult> UploadProfileImage([FromRoute] int id, IFormFile file, CancellationToken cancellationToken = default)
    {
        var engineer = await unitOfWork.Engineers.GetByIdAsync(id)
            ?? throw new InteriorHub.Application.Common.Exceptions.NotFoundException($"Engineer {id} was not found.");

        engineer.ProfileImageUrl = await cloudinaryService.UploadImageAsync(file, "engineers", cancellationToken);
        unitOfWork.Engineers.Update(engineer);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Ok(new { profileImageUrl = engineer.ProfileImageUrl });
    }
}
