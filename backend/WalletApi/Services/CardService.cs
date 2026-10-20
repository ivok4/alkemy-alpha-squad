using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using WalletApi.Data.Entities;
using WalletApi.Dtos;
using WalletApi.Interfaces;
using WalletApi.Models;
using VirtualCardEntity = WalletApi.Data.Entities.VirtualCard;

namespace WalletApi.Services;

public class CardService(WalletContext context) : ICardService
{
    private readonly WalletContext _context = context;

    public async Task<VirtualCardResponseDto?> GetMyCardAsync(int userId)
    {
        var card = await _context.VirtualCards
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (card == null)
            return null;

        return MapToDto(card);
    }

    public async Task<VirtualCardResponseDto> CreateCardAsync(int userId)
    {
        var alreadyHasCard = await _context.VirtualCards.AnyAsync(c => c.UserId == userId);
        if (alreadyHasCard)
        {
            throw new InvalidOperationException("Ya tienes una tarjeta virtual asociada a tu cuenta.");
        }

        var randomDigits = string.Join("", Enumerable.Range(0, 15).Select(_ => RandomNumberGenerator.GetInt32(0, 10).ToString()));
        var cardNumber = $"4{randomDigits}";

        var expiration = DateTime.UtcNow.AddYears(4).ToString("MM/yy");

        var cvv = RandomNumberGenerator.GetInt32(100, 1000).ToString();

        var newCard = new VirtualCardEntity
        {
            UserId = userId,
            CardNumber = cardNumber,
            ExpirationDate = expiration,
            Cvv = cvv,
            IsFrozen = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.VirtualCards.Add(newCard);
        await _context.SaveChangesAsync();

        return MapToDto(newCard);
    }

    public async Task<ToggleFreezeResponseDto> ToggleFreezeAsync(int userId)
    {
        var card = await _context.VirtualCards.FirstOrDefaultAsync(c => c.UserId == userId);

        if (card == null)
        {
            throw new KeyNotFoundException("No tienes una tarjeta virtual creada.");
        }

        card.IsFrozen = !card.IsFrozen;
        await _context.SaveChangesAsync();

        var estado = card.IsFrozen ? "congelada" : "descongelada";

        return new ToggleFreezeResponseDto
        {
            Message = $"Tu tarjeta ha sido {estado} exitosamente.",
            IsFrozen = card.IsFrozen
        };
    }

    private static VirtualCardResponseDto MapToDto(VirtualCardEntity card) => new()
    {
        Id = card.Id,
        UserId = card.UserId,
        CardNumber = card.CardNumber,
        ExpirationDate = card.ExpirationDate,
        Cvv = card.Cvv,
        IsFrozen = card.IsFrozen,
        CreatedAt = card.CreatedAt
    };
}