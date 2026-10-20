using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using WalletApi.Interfaces;
using WalletApi.Data.Entities;
using WalletApi.Dtos;

namespace WalletApi.Controllers
{
    // Solo exigimos que estén logueados
    [Authorize]
    [Route("api/profile")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly UserManager<User> _userManager;

        public ProfileController(IUserService userService, UserManager<User> userManager)
        {
            _userService = userService;
            _userManager = userManager;
        }

        [HttpGet("me")]
        [ProducesResponseType(typeof(UserDetailResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserDetailResponseDto>> ObtenerUsuarioAutenticado()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Token inválido o no autorizado." });
            }

            var userDetail = await _userService.ObtenerDetallePorIdAsync(userId);

            if (userDetail == null)
            {
                return NotFound(new { message = "Usuario no encontrado." });
            }

            return Ok(userDetail);
        }

        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> ActualizarMiPerfil([FromBody] UpdateProfileDto request)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Token inválido o no autorizado." });
            }

            var user = _userService.ObtenerPorId(userId);
            if (user == null)
            {
                return NotFound(new { message = "Usuario no encontrado." });
            }

            bool emailChanged = !string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase);

            if (emailChanged)
            {
                if (string.IsNullOrEmpty(request.ContrasenaActual))
                {
                    return Unauthorized(new { message = "Contraseña actual requerida para cambiar el email." });
                }

                bool isPasswordValid = await _userManager.CheckPasswordAsync(user, request.ContrasenaActual);
                if (!isPasswordValid)
                {
                    return BadRequest(new { message = "Contraseña actual incorrecta requerida para cambiar el email." });
                }

                var emailExists = _userService.ObtenerPorEmail(request.Email);
                if (emailExists != null && emailExists.Id != user.Id)
                {
                    return BadRequest(new { message = "El email ya está en uso." });
                }

                user.Email = request.Email;
            }

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;

            // Guardar cambios de forma asíncrona en el servicio
            var actualizado = await _userService.ActualizarAsync(user);
            if (!actualizado)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error al actualizar el perfil en la base de datos." });
            }

            return Ok(new { message = "Perfil actualizado correctamente." });
        }
    }
}
