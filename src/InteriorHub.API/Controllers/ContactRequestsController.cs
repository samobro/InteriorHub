using InteriorHub.Application.DTOs.ContactRequests;
using InteriorHub.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InteriorHub.API.Controllers;

[ApiController]
[Route("api/contact-requests")]
public sealed class ContactRequestsController(IContactRequestService contactRequestService) : BaseApiController
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ContactRequestCreateDto dto, CancellationToken cancellationToken)
        => Ok(await contactRequestService.CreateAsync(dto, cancellationToken));
}
