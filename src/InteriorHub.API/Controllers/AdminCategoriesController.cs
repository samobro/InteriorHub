using InteriorHub.Application.DTOs.Categories;
using InteriorHub.Application.Interfaces;
using InteriorHub.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteriorHub.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/categories")]
public sealed class AdminCategoriesController(
    ICategoryService categoryService,
    ICloudinaryService cloudinaryService,
    IUnitOfWork unitOfWork) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        // TODO: Add real admin authentication/authorization wiring.
        return Ok(await categoryService.GetAllAsync(cancellationToken));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CategoryCreateDto dto, CancellationToken cancellationToken)
    {
        // TODO: Add real admin authentication/authorization wiring.
        return Ok(await categoryService.CreateAsync(dto, cancellationToken));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] CategoryUpdateDto dto, CancellationToken cancellationToken)
    {
        // TODO: Add real admin authentication/authorization wiring.
        return Ok(await categoryService.UpdateAsync(id, dto, cancellationToken));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken cancellationToken)
    {
        // TODO: Add real admin authentication/authorization wiring.
        await categoryService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:int}/image")]
    public async Task<IActionResult> UploadImage([FromRoute] int id, IFormFile file, CancellationToken cancellationToken)
    {
        var category = await unitOfWork.Categories.GetByIdAsync(id)
            ?? throw new InteriorHub.Application.Common.Exceptions.NotFoundException($"Category {id} was not found.");

        category.ImageUrl = await cloudinaryService.UploadImageAsync(file, "categories", cancellationToken);
        unitOfWork.Categories.Update(category);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Ok(new { imageUrl = category.ImageUrl });
    }
}
