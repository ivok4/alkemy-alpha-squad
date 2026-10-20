namespace WalletApi.Exceptions;

/// <summary>
/// Excepción base para errores controlados de la aplicación con código de error y status HTTP.
/// </summary>
public class AppException : Exception
{
    public int StatusCode { get; }
    public string ErrorCode { get; }

    public AppException(
        string message,
        string errorCode = "BAD_REQUEST",
        int statusCode = StatusCodes.Status400BadRequest)
        : base(message)
    {
        ErrorCode = errorCode;
        StatusCode = statusCode;
    }
}
