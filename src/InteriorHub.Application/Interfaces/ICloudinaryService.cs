using Microsoft.AspNetCore.Http;

namespace InteriorHub.Application.Interfaces;

public interface ICloudinaryService
{
    Task<string> UploadImageAsync(IFormFile file, string folder, CancellationToken cancellationToken = default);
}
