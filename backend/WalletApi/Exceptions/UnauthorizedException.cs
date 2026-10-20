namespace WalletApi.Exceptions;

/// <summary>
/// Excepción para operaciones no autorizadas (401 Unauthorized).
/// </summary>
public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "No autorizado para realizar esta acción.", string errorCode = "UNAUTHORIZED")
        : base(message, errorCode, StatusCodes.Status401Unauthorized)
    {
    }
}
