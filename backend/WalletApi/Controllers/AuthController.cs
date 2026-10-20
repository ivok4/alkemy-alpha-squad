using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WalletApi.Dtos;
using WalletApi.Services;
using WalletApi.Interfaces;
using System.Security.Claims;
namespace WalletApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }
    /// <summary>
    /// Gets all active document types for registration.
    /// </summary>
    [HttpGet("document-types")]
    [ProducesResponseType(typeof(IReadOnlyList<DocumentTypeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDocumentTypes()
    {
        var documentTypes = await _authService.GetDocumentTypesAsync();
        return Ok(documentTypes);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _authService.LoginAsync(request);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Login failed for email {Email}: {Message}", request.Email, ex.Message);

            return Unauthorized(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Login validation error: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during user login for email {Email}.", request.Email);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred during login. Please try again later." });
        }
    }

    /// <summary>
    /// Self-registration endpoint for new users. Creates an ARS account with $0 balance,
    /// a unique 3-word alias, and a 22-digit CVU.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(RegisterUserResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterUserRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _authService.RegisterAsync(request);
            return StatusCode(StatusCodes.Status201Created, result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Registration conflict: {Message}", ex.Message);
            return Conflict(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Registration validation error: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during user registration.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred during registration. Please try again later." });
        }
    }
        [HttpPost("first-login/verify")]
        [ProducesResponseType(typeof(FirstLoginVerifyResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> VerifyFirstLogin([FromBody] FirstLoginVerifyRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _authService.VerifyFirstLoginEligibilityAsync(request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar primer ingreso para {Email}.", request.Email);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Ocurrió un error al verificar el usuario." });
            }
        }

        [HttpPost("first-login/set-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SetFirstLoginPassword([FromBody] FirstLoginSetPasswordRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _authService.SetFirstLoginPasswordAsync(request);
                return Ok(new { message = "Contraseña establecida con éxito. Ahora puedes iniciar sesión con tus credenciales." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al establecer contraseña de primer ingreso para {Email}.", request.Email);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Ocurrió un error al establecer la contraseña." });
            }
        }

        [HttpPost("logout")]
        [Authorize]//Se puede quitar, es para que solo el usuario registrado pueda desloguearse
        public async Task<IActionResult> Logout()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            await _authService.RevokeSessionsAsync(userId);

            return Ok(new { message = "Sesión cerrada. Todos los tokens previos han sido invalidados." });
        }
}
