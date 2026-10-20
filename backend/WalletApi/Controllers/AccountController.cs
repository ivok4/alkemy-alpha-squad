using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WalletApi.Dtos;
using WalletApi.Services;
using WalletApi.Interfaces;
namespace WalletApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly IAccountService _accountService;
    private readonly ILogger<AccountController> _logger;

    public AccountController(IAccountService accountService, ILogger<AccountController> logger)
    {
        _accountService = accountService;
        _logger = logger;
    }

    /// <summary>
    /// Depositar dinero en la cuenta propia del usuario autenticado.
    /// </summary>
    [HttpPost("deposit")]
    [ProducesResponseType(typeof(DepositResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Deposit([FromBody] DepositRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "No se pudo identificar al usuario." });
        }

        try
        {
            var result = await _accountService.DepositAsync(userId.Value, request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Deposit validation error for user {UserId}: {Message}", userId, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Deposit operation error for user {UserId}: {Message}", userId, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during deposit for user {UserId}.", userId);
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Ocurrió un error al procesar el depósito. Intente nuevamente." });
        }
    }

    /// <summary>
    /// Obtener el saldo y datos de la cuenta del usuario autenticado.
    /// </summary>
    [HttpGet("balance")]
    [ProducesResponseType(typeof(AccountResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetBalance()
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "No se pudo identificar al usuario." });
        }

        try
        {
            var result = await _accountService.GetBalanceAsync(userId.Value);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Balance query error for user {UserId}: {Message}", userId, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error fetching balance for user {UserId}.", userId);
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Ocurrió un error al obtener el saldo." });
        }
    }

    [HttpGet("me")]
    public async Task<IActionResult> ObtenerMiCuenta()
    {
        return await GetBalance();
    }

    [HttpPut("alias")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateAlias([FromBody] UpdateAliasDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "No se pudo identificar al usuario." });
        }

        try
        {
            await _accountService.UpdateAliasAsync(userId.Value, request.Alias);
            return Ok(new { message = "Alias actualizado correctamente." });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Alias validation error for user {UserId}: {Message}", userId, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Alias not found/error for user {UserId}: {Message}", userId, ex.Message);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error updating alias for user {UserId}.", userId);
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = "Ocurrió un error al actualizar el alias." });
        }
    }
    private int? GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return null;
        }
        return userId;
    }

}