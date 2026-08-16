using InteriorHub.Application.DTOs.Projects;
using InteriorHub.Application.Interfaces;
using InteriorHub.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteriorHub.API.Controllers;

[ApiController]
[Authorize(Roles = "Engineer,Admin")]
[Route("api/me")]
public sealed class MeController(
    IEngineerService engineerService,
    IProjectService projectService,
    IContactRequestService contactRequestService,
    ICloudinaryService cloudinaryService,
    IUnitOfWork unitOfWork) : BaseApiController
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

    [HttpPost("profile-image")]
    public async Task<IActionResult> UploadProfileImage(IFormFile file, CancellationToken cancellationToken = default)
    {
        var engineer = await unitOfWork.Engineers.GetByIdAsync(GetCurrentEngineerId())
            ?? throw new InteriorHub.Application.Common.Exceptions.NotFoundException("Engineer was not found.");

        engineer.ProfileImageUrl = await cloudinaryService.UploadImageAsync(file, "engineers", cancellationToken);
        unitOfWork.Engineers.Update(engineer);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Ok(new { profileImageUrl = engineer.ProfileImageUrl });
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
    [Consumes("application/json")]
    public async Task<IActionResult> AddProjectImages([FromRoute] int id, [FromBody] List<ProjectImageCreateDto> images, CancellationToken cancellationToken = default)
        => Ok(await projectService.AddImagesAsync(GetCurrentEngineerId(), id, images, cancellationToken));

    [HttpPost("projects/{projectId:int}/images")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadProjectImage(
        [FromRoute] int projectId,
        IFormFile file,
        [FromForm] int displayOrder = 0,
        CancellationToken cancellationToken = default)
    {
        var project = await unitOfWork.Projects.GetByIdAsync(projectId)
            ?? throw new InteriorHub.Application.Common.Exceptions.NotFoundException($"Project {projectId} was not found.");

        var engineerId = GetCurrentEngineerId();
        if (project.EngineerId != engineerId)
        {
            throw new InteriorHub.Application.Common.Exceptions.ForbiddenException("You can only modify your own projects.");
        }

        var imageUrl = await cloudinaryService.UploadImageAsync(file, "projects", cancellationToken);
        var image = new InteriorHub.Domain.Entities.ProjectImage
        {
            ProjectId = projectId,
            ImageUrl = imageUrl,
            DisplayOrder = displayOrder
        };

        await unitOfWork.ProjectImages.AddAsync(image);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Ok(new ProjectImageReadDto
        {
            Id = image.Id,
            ProjectId = image.ProjectId,
            ImageUrl = image.ImageUrl,
            DisplayOrder = image.DisplayOrder
        });
    }

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
