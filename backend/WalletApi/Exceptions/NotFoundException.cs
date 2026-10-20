namespace WalletApi.Exceptions;

/// <summary>
/// Excepción para recursos no encontrados (404 Not Found).
/// </summary>
public class NotFoundException : AppException
{
    public NotFoundException(string message = "El recurso solicitado no fue encontrado.", string errorCode = "NOT_FOUND")
        : base(message, errorCode, StatusCodes.Status404NotFound)
    {
    }
}
