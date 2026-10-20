using WalletApi.Dtos;

namespace WalletApi.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<RegisterUserResponseDto> RegisterAsync(RegisterUserRequestDto request);
    Task<IReadOnlyList<DocumentTypeDto>> GetDocumentTypesAsync();

    Task<FirstLoginVerifyResponseDto> VerifyFirstLoginEligibilityAsync(FirstLoginVerifyRequestDto request);
    Task<bool> SetFirstLoginPasswordAsync(FirstLoginSetPasswordRequestDto request);

//Agregado de mas-------------------------------------------------------------
    Task RevokeSessionsAsync(int userId);
}
