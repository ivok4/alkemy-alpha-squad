using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using WalletApi.Data.Entities;
using WalletApi.Interfaces;
using WalletApi.Options;

namespace WalletApi.Services;

public class JwtTokenService(IOptions<JwtOptions> jwtOptions) : ITokenService
{
    private readonly JwtOptions _jwtOptions = jwtOptions.Value;

    public string CrearToken(User user, IEnumerable<string> roles)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),

            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            
            // Guardamos el SecurityStamp actual en el token
            new Claim("AspNet.Identity.SecurityStamp", user.SecurityStamp ?? string.Empty)
        };

        foreach (var rol in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, rol));
        }

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Key));

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtOptions.ExpirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
