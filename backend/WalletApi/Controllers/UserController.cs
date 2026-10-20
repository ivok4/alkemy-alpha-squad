using WalletApi.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using WalletApi.Models;
using WalletApi.Dtos;
using WalletApi.Data.Entities;
using Microsoft.AspNetCore.Identity;
namespace WalletApi.Controllers
{
    [Authorize(Roles = "Administrador")]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly UserManager<User> _userManager;

        public UserController(IUserService userService, UserManager<User> userManager)
        {
            _userService = userService;
            _userManager = userManager;
        }
        [HttpGet]
        public async Task<ActionResult<PagedUsersResponseDto>> ObtenerUsuarios(
                    [FromQuery] int pagina = 1,
                    [FromQuery] int porPagina = 10)
        {
            if (pagina < 1) pagina = 1;
            if (porPagina < 1 || porPagina > 100) porPagina = 10;

            var resultado = await _userService.ObtenerUsuariosPaginadosAsync(pagina, porPagina);
            return Ok(resultado);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(UserDetailResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]

        public async Task<ActionResult<UserDetailResponseDto>> ObtenerPorId(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El identificador de usuario debe ser mayor a cero." });
            }

            var userDetail = await _userService.ObtenerDetallePorIdAsync(id);


            if (userDetail == null)
            {
                return NotFound(new { message = "Usuario no encontrado" });
            }

            return Ok(userDetail);
        }

        [HttpPost]
        [ProducesResponseType(typeof(UserDetailResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<UserDetailResponseDto>> CrearUsuario([FromBody] CreateUserAdminRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var usuarioCreado = await _userService.CrearUsuarioPorAdminAsync(request);

                return CreatedAtAction(
                    nameof(ObtenerPorId),
                    new { id = usuarioCreado.Id },
                    usuarioCreado
                );
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Ocurrió un error inesperado al crear el usuario." });
            }
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(UserDetailResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<UserDetailResponseDto>> ActualizarUsuario(int id, [FromBody] UpdateUserAdminRequestDto request)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El identificador de usuario debe ser mayor a cero." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var usuarioActualizado = await _userService.ActualizarUsuarioPorAdminAsync(id, request);
                return Ok(usuarioActualizado);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message.Contains("email", StringComparison.OrdinalIgnoreCase))
                {
                    return Conflict(new { message = ex.Message });
                }
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Ocurrió un error inesperado al actualizar el usuario." });
            }
        }

        [HttpPatch("{id:int}/status")]
        [ProducesResponseType(typeof(UserDetailResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserDetailResponseDto>> CambiarEstado(int id, [FromBody] UpdateUserStatusRequestDto request)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "El identificador de usuario debe ser mayor a cero." });
            }

            try
            {
                var usuarioActualizado = await _userService.CambiarEstadoUsuarioPorAdminAsync(id, request.IsActive);
                return Ok(usuarioActualizado);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Ocurrió un error inesperado al modificar el estado del usuario." });
            }
        }

        [HttpDelete("{id:int}")]
        public ActionResult<User> Eliminar(int id)
        {
            if (id <= 0)
                return BadRequest();

            var userSearched = _userService.ObtenerPorId(id);

            if (userSearched == null)
                return BadRequest();

            var userEliminadoCorrectamente = _userService.Eliminar(userSearched);
            if (!userEliminadoCorrectamente)
                return NotFound();

            return NoContent();
        }
    }
}
