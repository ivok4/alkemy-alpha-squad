using WalletApi.Dtos;

namespace WalletApi.Interfaces;

public interface ICardService
{
    Task<VirtualCardResponseDto?> GetMyCardAsync(int userId);
    Task<VirtualCardResponseDto> CreateCardAsync(int userId);
    Task<ToggleFreezeResponseDto> ToggleFreezeAsync(int userId);
}