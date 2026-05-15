using System.Security.Claims;
using frontendnet.Services;

namespace frontendnet.Middlewares;

public class RefrescaTokenDelegatingHandler(AuthClientService auth, IHttpContextAccessor httpContextAccessor) : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var response = await base.SendAsync(request, cancellationToken);
        // Revisa si el servidor nos envió un nuevo token
        if (response.Headers.Contains("Set-Authorization"))
        {
            string jwt = response.Headers.GetValues("Set-Authorization").FirstOrDefault()!;
            var claims = new List<Claim>
            {
                // Todo esto se guarda en la Cookie
                new(ClaimTypes.Name, httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name)!),
                new(ClaimTypes.GivenName, httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.GivenName)!),
                new("jwt", jwt),
                new(ClaimTypes.Role, httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role)!),
            };
            auth.IniciaSesionAsync(claims);
        }
        return response;
    }
}
