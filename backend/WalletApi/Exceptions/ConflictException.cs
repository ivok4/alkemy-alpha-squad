namespace WalletApi.Exceptions;

/// <summary>
/// Excepción para conflictos de estado (409 Conflict), ej. email o alias ya registrado.
/// </summary>
public class ConflictException : AppException
{
    public ConflictException(string message, string errorCode = "CONFLICT")
        : base(message, errorCode, StatusCodes.Status409Conflict)
    {
    }
}
