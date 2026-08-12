using System.Security.Claims;
using OpenIddict.Abstractions;
using AuthModule.Domain.Entities;
using Microsoft.IdentityModel.Tokens;

namespace AuthModule.Infrastructure.Security;

public static class AuthPrincipalFactory
{
    public static ClaimsPrincipal CreatePrincipal(int engineerId, string name, string email, string role)
    {
        var identity = new ClaimsIdentity(
            authenticationType: TokenValidationParameters.DefaultAuthenticationType,
            nameType: ClaimTypes.Name,
            roleType: ClaimTypes.Role);

        identity.AddClaim(new Claim("EngineerId", engineerId.ToString()));
        identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, engineerId.ToString()));
        identity.AddClaim(new Claim(ClaimTypes.Name, name));
        identity.AddClaim(new Claim(ClaimTypes.Email, email));
        identity.AddClaim(new Claim(ClaimTypes.Role, role));
        identity.AddClaim(new Claim(OpenIddictConstants.Claims.Subject, engineerId.ToString()));

        identity.SetDestinations(static claim => claim.Type switch
        {
            "EngineerId" => [OpenIddictConstants.Destinations.AccessToken],
            ClaimTypes.NameIdentifier => [OpenIddictConstants.Destinations.AccessToken],
            ClaimTypes.Name => [OpenIddictConstants.Destinations.AccessToken],
            ClaimTypes.Email => [OpenIddictConstants.Destinations.AccessToken],
            ClaimTypes.Role => [OpenIddictConstants.Destinations.AccessToken],
            OpenIddictConstants.Claims.Subject => [OpenIddictConstants.Destinations.AccessToken],
            _ => []
        });

        return new ClaimsPrincipal(identity);
    }
}
