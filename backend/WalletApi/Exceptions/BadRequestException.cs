namespace WalletApi.Exceptions;

/// <summary>
/// Excepción para peticiones inválidas de negocio (400 Bad Request).
/// </summary>
public class BadRequestException : AppException
{
    public BadRequestException(string message, string errorCode = "BAD_REQUEST")
        : base(message, errorCode, StatusCodes.Status400BadRequest)
    {
    }
}
