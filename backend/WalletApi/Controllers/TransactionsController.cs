using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WalletApi.Dtos;
using WalletApi.Models;
using WalletApi.Services;
using WalletApi.Interfaces;
using WalletApi.Data.Entities;

namespace WalletApi.Controllers;

[Authorize] // <--- ¡AQUÍ ESTÁ EL AUTHORIZE que protege todo el controlador!
[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly WalletContext _context;
    private readonly IAccountService _accountService;
    private readonly ILogger<TransactionsController> _logger;

    public TransactionsController(
        WalletContext context,
        IAccountService accountService,
        ILogger<TransactionsController> logger)
    {
        _context = context;
        _accountService = accountService;
        _logger = logger;
    }

    /// <summary>
    /// Historial de movimientos del usuario autenticado (paginado y filtrado por fecha y tipo).
    /// </summary>
    /// <param name="fechaDesde">Fecha inicial de filtrado (opcional).</param>
    /// <param name="fechaHasta">Fecha final de filtrado (opcional).</param>
    /// <param name="tipo">Tipo de transacción: "all", "debit" (sent), o "credit" (received/deposit).</param>
    /// <param name="pagina">Número de página (por defecto: 1).</param>
    /// <param name="porPagina">Cantidad de elementos por página (por defecto: 10).</param>
    /// <response code="200">Historial de transacciones obtenido correctamente.</response>
    /// <response code="401">Usuario no autenticado o token inválido.</response>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyTransactions(
        [FromQuery] DateTime? fechaDesde,
        [FromQuery] DateTime? fechaHasta,
        [FromQuery] string? tipo,
        [FromQuery] int pagina = 1,
        [FromQuery] int porPagina = 10)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
        {
            return Unauthorized();
        }

        var query = _context.Transactions
            .Include(t => t.Account)
            .Include(t => t.CounterpartAccount)
                .ThenInclude(ca => ca!.User)
            .Where(t => t.Account.UserId == userId)
            .AsQueryable();

        if (fechaDesde.HasValue)
        {
            query = query.Where(t => t.CreatedAt >= fechaDesde.Value);
        }
        if (fechaHasta.HasValue)
        {
            query = query.Where(t => t.CreatedAt <= fechaHasta.Value);
        }

        if (!string.IsNullOrEmpty(tipo) && tipo.ToLower() != "all")
        {
            var tipoLower = tipo.ToLower();
            if (tipoLower == "sent" || tipoLower == "debito" || tipoLower == "debit")
            {
                query = query.Where(t => t.Type == TransactionType.Debit);
            }
            else if (tipoLower == "received" || tipoLower == "recived" || tipoLower == "credito" || tipoLower == "credit")
            {
                query = query.Where(t => t.Type == TransactionType.Credit || t.Type == TransactionType.Deposit);
            }
        }

        var totalRegistros = await query.CountAsync();

        var transacciones = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((pagina - 1) * porPagina)
            .Take(porPagina)
            .Select(t => new
            {
                t.Id,
                t.AccountId,
                t.Amount,
                Date = t.CreatedAt,
                Tipo = (t.Type == TransactionType.Credit || t.Type == TransactionType.Deposit) ? "Crédito" : "Débito",
                t.Description,
                t.CounterpartAccountId
            })
            .ToListAsync();

        return Ok(new
        {
            totalRegistros,
            paginaActual = pagina,
            porPagina,
            totalPaginas = (int)Math.Ceiling(totalRegistros / (double)porPagina),
            transacciones
        });
    }

    /// <summary>
    /// Consulta y valida los datos de un destinatario por Alias o CVU antes de transferir.
    /// </summary>
    /// <param name="destination">Alias (palabras separadas por puntos) o CVU (22 dígitos numéricos).</param>
    /// <response code="200">Destinatario encontrado con éxito.</response>
    /// <response code="400">Destino con formato inválido o pertenece a la propia cuenta.</response>
    /// <response code="401">Usuario no autenticado.</response>
    /// <response code="404">No existe ninguna cuenta asociada al Alias o CVU ingresado.</response>
    [HttpGet("lookup")]
    [ProducesResponseType(typeof(RecipientLookupResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> LookupRecipient([FromQuery] string destination)
    {
        // ¡AQUÍ ESTÁN LOS CLAIMS! Extrae el ID del usuario del Token JWT
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
        {
            return Unauthorized(new { message = "Usuario no autenticado." });
        }

        try
        {
            var result = await _accountService.LookupRecipientAsync(userId, destination);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Realiza una transferencia atómica de fondos hacia otra cuenta por Alias o CVU.
    /// </summary>
    /// <param name="request">Datos de la transferencia: destino (Alias o CVU) y monto.</param>
    /// <response code="200">Transferencia realizada exitosamente con comprobante y nuevo saldo.</response>
    /// <response code="400">Saldo insuficiente, monto inválido o destino propio.</response>
    /// <response code="401">Usuario no autenticado.</response>
    /// <response code="404">Cuenta de destino no encontrada.</response>
    [HttpPost("transfer")]
    [ProducesResponseType(typeof(TransferResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Transfer([FromBody] TransferRequestDto request)
    {
        // Valida las DataAnnotations del DTO ([Required], etc.)
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // ¡AQUÍ ESTÁN LOS CLAIMS!
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
        {
            return Unauthorized(new { message = "Usuario no autenticado." });
        }

        try
        {
            var result = await _accountService.TransferAsync(userId, request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}