namespace WalletApi.Exceptions;

/// <summary>
/// Excepción lanzada cuando una cuenta no tiene saldo suficiente para realizar una operación.
/// </summary>
public class InsufficientFundsException : AppException
{
    public InsufficientFundsException(string message = "Saldo insuficiente para realizar la operación.")
        : base(message, "INSUFFICIENT_FUNDS", StatusCodes.Status400BadRequest)
    {
    }
}
