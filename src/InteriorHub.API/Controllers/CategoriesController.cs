using InteriorHub.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InteriorHub.API.Controllers;

[ApiController]
[Route("api/categories")]
public sealed class CategoriesController(ICategoryService categoryService) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => Ok(await categoryService.GetAllAsync(cancellationToken));
}
