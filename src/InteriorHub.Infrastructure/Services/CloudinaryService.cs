using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using InteriorHub.Application.Common.Exceptions;
using InteriorHub.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace InteriorHub.Infrastructure.Services;

public sealed class CloudinaryService : ICloudinaryService
{
    private const long MaxFileSize = 5 * 1024 * 1024;
    private static readonly HashSet<string> AllowedContentTypes =
    [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    private readonly Cloudinary cloudinary;

    public CloudinaryService(IConfiguration configuration)
    {
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

        if (string.IsNullOrWhiteSpace(cloudName) ||
            string.IsNullOrWhiteSpace(apiKey) ||
            string.IsNullOrWhiteSpace(apiSecret))
        {
            throw new InvalidOperationException(
                "Cloudinary is not configured. Set Cloudinary:CloudName, Cloudinary:ApiKey, and Cloudinary:ApiSecret in configuration/user-secrets.");
        }

        cloudinary = new Cloudinary(new Account(cloudName, apiKey, apiSecret));
    }

    public async Task<string> UploadImageAsync(IFormFile file, string folder, CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
        {
            throw new BadRequestException("An image file is required.");
        }

        if (!AllowedContentTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase))
        {
            throw new BadRequestException("Only JPEG, PNG, and WebP images are allowed.");
        }

        if (file.Length > MaxFileSize)
        {
            throw new BadRequestException("Image files must be 5 MB or smaller.");
        }

        await using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = folder
        };

        var result = await cloudinary.UploadAsync(uploadParams, cancellationToken);
        if (result.Error is not null || result.SecureUrl is null)
        {
            throw new InvalidOperationException(result.Error?.Message ?? "Cloudinary image upload failed.");
        }

        return result.SecureUrl.ToString();
    }
}
