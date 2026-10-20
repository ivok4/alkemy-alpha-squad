using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WalletApi.Dtos;
using WalletApi.Interfaces;

namespace WalletApi.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CardController(ICardService cardService) : ControllerBase
{
    private readonly ICardService _cardService = cardService;

    [HttpGet("me")]
    [ProducesResponseType(typeof(VirtualCardResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMyCard()
    {
        var userId = GetCurrentUserId();
        var card = await _cardService.GetMyCardAsync(userId);

        if (card == null)
        {
            return NotFound(new { message = "No tienes una tarjeta virtual creada." });
        }

        return Ok(card);
    }

    [HttpPost("create")]
    [ProducesResponseType(typeof(VirtualCardResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateCard()
    {
        var userId = GetCurrentUserId();
        var newCard = await _cardService.CreateCardAsync(userId);
        return Ok(newCard);
    }

    [HttpPut("toggle-freeze")]
    [ProducesResponseType(typeof(ToggleFreezeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleFreeze()
    {
        var userId = GetCurrentUserId();
        var result = await _cardService.ToggleFreezeAsync(userId);
        return Ok(result);
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int userId))
        {
            throw new UnauthorizedAccessException("Usuario no autenticado.");
        }

        return userId;
    }
}