using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WalletApi.Interfaces;
namespace WalletApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet("ping")]
    [Authorize]
    public IActionResult Ping()
    {
        return Ok("Token válido");
    }
    [HttpGet("mi-cuenta")]
    [Authorize]
    public IActionResult ObtenerMiCuenta()
    {
        // Obtiene el ID del usuario autenticado directamente del token verificado
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized();
        }

        // Puedes usar userId para buscar en tu repositorio/DbContext:
        // var account = await _accountRepository.GetByUserIdAsync(userId);

        return Ok(new { Mensaje = $"Petición realizada por el usuario con ID {userId}" });
    }

}
   

