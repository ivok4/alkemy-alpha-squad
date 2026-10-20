using Microsoft.EntityFrameworkCore;
using WalletApi.Data.Entities;
using WalletApi.Dtos;
using WalletApi.Models;
using WalletApi.Interfaces;
using WalletApi.Exceptions;

namespace WalletApi.Services;

public class AccountService : IAccountService
{
    private readonly WalletContext _context;
    private readonly IAliasGeneratorService _aliasGenerator;
    private readonly ICvuGeneratorService _cvuGenerator;
    private readonly INotificationService _notificationService;

    public AccountService(
        WalletContext context,
        IAliasGeneratorService aliasGenerator,
        ICvuGeneratorService cvuGenerator,
        INotificationService notificationService)
    {
        _context = context;
        _aliasGenerator = aliasGenerator;
        _cvuGenerator = cvuGenerator;
        _notificationService = notificationService;
    }

    // 1. DEPÓSITO DE DINERO
    public async Task<DepositResponseDto> DepositAsync(int userId, DepositRequestDto request)
    {
        if (decimal.Round(request.Amount, 2) != request.Amount)
        {
            throw new ArgumentException("El importe no puede tener más de 2 decimales.");
        }

        if (request.Amount <= 0)
        {
            throw new ArgumentException("El importe debe ser mayor a cero.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null || !user.IsActive)
        {
            throw new InvalidOperationException("El usuario se encuentra inactivo y no puede realizar depósitos.");
        }

        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.UserId == userId);

        if (account == null)
        {
            throw new InvalidOperationException("No se encontró una cuenta asociada al usuario.");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Incremento atómico directo en SQL Server (Previene condiciones de carrera)
            var filasAfectadas = await _context.Accounts
                .Where(a => a.Id == account.Id)
                .ExecuteUpdateAsync(setter => setter.SetProperty(
                    a => a.Balance,
                    a => a.Balance + request.Amount
                ));

            if (filasAfectadas == 0)
            {
                throw new InvalidOperationException("No se pudo actualizar el saldo. La cuenta pudo haber sido eliminada o modificada simultáneamente.");
            }

            var tx = new Transaction
            {
                AccountId = account.Id,
                Amount = request.Amount,
                CounterpartAccountId = null,
                Type = TransactionType.Deposit, // Criterio: Genera un movimiento de depósito registrado con fecha
                Description = "Depósito de dinero",
                CreatedAt = DateTime.UtcNow
            };

            _context.Transactions.Add(tx);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            try
            {
                await _notificationService.CreateNotificationAsync(
                    userId,
                    "Depósito exitoso",
                    $"Se acreditaron ${request.Amount:N2} en tu cuenta.",
                    "deposit",
                    tx.Id
                );
            }
            catch
            {
                // No interrumpir la respuesta si falla la notificación
            }

            var newBalance = account.Balance + request.Amount;

            return new DepositResponseDto
            {
                TransactionId = tx.Id,
                Amount = request.Amount,
                NewBalance = newBalance,
                Date = tx.CreatedAt,
                Message = "Depósito realizado con éxito."
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    // 2. CONSULTAR SALDO
    public async Task<AccountResponseDto> GetBalanceAsync(int userId)
    {
        var account = await _context.Accounts
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.UserId == userId);

        if (account == null)
        {
            throw new InvalidOperationException("No se encontró una cuenta asociada al usuario.");
        }

        return new AccountResponseDto
        {
            Id = account.Id,
            Balance = account.Balance,
            Currency = account.Currency,
            Alias = account.Alias,
            Cvu = account.Cvu,
            CreatedAt = account.CreatedAt
        };
    }

    // 3. BUSCAR DESTINATARIO (ALIAS / CVU)
    public async Task<RecipientLookupResponseDto> LookupRecipientAsync(int userId, string destination)
    {
        var trimmed = destination?.Trim() ?? string.Empty;
        var (isValid, isCvu) = ValidateDestinationFormat(trimmed);

        if (!isValid)
        {
            throw new ArgumentException("El destino ingresado debe ser un CVU válido (22 dígitos) o un Alias (palabras separadas por puntos).");
        }

        var query = _context.Accounts.Include(a => a.User).AsNoTracking();
        var targetAccount = isCvu
            ? await query.FirstOrDefaultAsync(a => a.Cvu == trimmed)
            : await query.FirstOrDefaultAsync(a => a.Alias == trimmed.ToLowerInvariant());

        if (targetAccount == null)
        {
            throw new KeyNotFoundException("No se encontró ninguna cuenta con el Alias o CVU ingresado.");
        }

        if (targetAccount.UserId == userId)
        {
            throw new InvalidOperationException("No podés transferir dinero a tu propia cuenta.");
        }

        if (targetAccount.User == null || !targetAccount.User.IsActive)
        {
            throw new InvalidOperationException("La cuenta de destino pertenece a un usuario inactivo.");
        }

        return new RecipientLookupResponseDto
        {
            AccountId = targetAccount.Id,
            RecipientName = $"{targetAccount.User.FirstName} {targetAccount.User.LastName}".Trim(),
            Alias = targetAccount.Alias,
            Cvu = targetAccount.Cvu
        };
    }

    // 4. TRANSFERENCIA ATÓMICA
    public async Task<TransferResponseDto> TransferAsync(int userId, TransferRequestDto request)
    {
        if (decimal.Round(request.Amount, 2) != request.Amount)
        {
            throw new ArgumentException("El importe no puede tener más de 2 decimales.");
        }

        if (request.Amount <= 0)
        {
            throw new ArgumentException("El importe debe ser mayor a cero.");
        }

        var sourceUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (sourceUser == null || !sourceUser.IsActive)
        {
            throw new InvalidOperationException("El usuario de origen no está activo para operar.");
        }

        var sourceAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.UserId == userId);
        if (sourceAccount == null)
        {
            throw new InvalidOperationException("No se encontró una cuenta asociada al usuario autenticado.");
        }

        if (sourceAccount.Balance < request.Amount)
        {
            throw new InsufficientFundsException("Saldo insuficiente para realizar la transferencia.");
        }

        var trimmed = request.Destination?.Trim() ?? string.Empty;
        var (isValid, isCvu) = ValidateDestinationFormat(trimmed);

        if (!isValid)
        {
            throw new ArgumentException("El destino ingresado debe ser un CVU válido (22 dígitos) o un Alias (palabras separadas por puntos).");
        }

        var targetAccount = isCvu
            ? await _context.Accounts.Include(a => a.User).FirstOrDefaultAsync(a => a.Cvu == trimmed)
            : await _context.Accounts.Include(a => a.User).FirstOrDefaultAsync(a => a.Alias == trimmed.ToLowerInvariant());

        if (targetAccount == null)
        {
            throw new KeyNotFoundException("No se encontró ninguna cuenta con el Alias o CVU ingresado.");
        }

        if (targetAccount.UserId == userId)
        {
            throw new InvalidOperationException("No podés transferir dinero a tu propia cuenta.");
        }

        if (targetAccount.User == null || !targetAccount.User.IsActive)
        {
            throw new InvalidOperationException("La cuenta de destino pertenece a un usuario inactivo.");
        }

        // Operación atómica de débito y crédito
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Débito seguro y atómico en Origen (La BD verifica que el saldo alcance)
            var debitoExitoso = await _context.Accounts
                .Where(a => a.Id == sourceAccount.Id && a.Balance >= request.Amount)
                .ExecuteUpdateAsync(setter => setter.SetProperty(
                    a => a.Balance,
                    a => a.Balance - request.Amount
                ));

            if (debitoExitoso == 0)
            {
                throw new InsufficientFundsException("Saldo insuficiente o la cuenta fue modificada simultáneamente.");
            }

            // 2. Crédito atómico en Destino
            await _context.Accounts
                .Where(a => a.Id == targetAccount.Id)
                .ExecuteUpdateAsync(setter => setter.SetProperty(
                    a => a.Balance,
                    a => a.Balance + request.Amount
                ));

            var now = DateTime.UtcNow;
            var destFullName = $"{targetAccount.User.FirstName} {targetAccount.User.LastName}".Trim();
            var sourceFullName = $"{sourceUser.FirstName} {sourceUser.LastName}".Trim();

            // 3. Generación de los 2 movimientos vinculados
            var debitTx = new Transaction
            {
                AccountId = sourceAccount.Id,
                CounterpartAccountId = targetAccount.Id,
                Amount = request.Amount,
                Type = TransactionType.Debit,
                Description = $"Transferencia enviada a {destFullName}",
                CreatedAt = now
            };
            _context.Transactions.Add(debitTx);
            await _context.SaveChangesAsync();

            var creditTx = new Transaction
            {
                AccountId = targetAccount.Id,
                CounterpartAccountId = sourceAccount.Id,
                Amount = request.Amount,
                Type = TransactionType.Credit,
                Description = $"Transferencia recibida de {sourceFullName}",
                CreatedAt = now,
                RelatedTransactionId = debitTx.Id
            };
            _context.Transactions.Add(creditTx);
            await _context.SaveChangesAsync();

            debitTx.RelatedTransactionId = creditTx.Id;
            await _context.SaveChangesAsync();

            // 4. Confirmación de toda la operación
            await transaction.CommitAsync();

            try
            {
                // Notificación para el emisor
                await _notificationService.CreateNotificationAsync(
                    userId,
                    "Transferencia enviada",
                    $"Enviaste ${request.Amount:N2} a {destFullName}.",
                    "transfer_sent",
                    debitTx.Id
                );

                // Notificación para el destinatario
                await _notificationService.CreateNotificationAsync(
                    targetAccount.UserId,
                    "Transferencia recibida",
                    $"Recibiste ${request.Amount:N2} de {sourceFullName}.",
                    "transfer_received",
                    creditTx.Id
                );
            }
            catch
            {
                // No interrumpir la respuesta si falla la notificación
            }

            var nuevoSaldo = sourceAccount.Balance - request.Amount;

            return new TransferResponseDto
            {
                DebitTransactionId = debitTx.Id,
                CreditTransactionId = creditTx.Id,
                Amount = request.Amount,
                NewBalance = nuevoSaldo,
                RecipientName = destFullName,
                RecipientAlias = targetAccount.Alias,
                RecipientCvu = targetAccount.Cvu,
                Date = debitTx.CreatedAt,
                Message = "Transferencia realizada con éxito."
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    // 5. HISTORIAL DE TRANSACCIONES (Cumple IAccountService)
    public async Task<List<TransactionDto>> GetTransactionsAsync(int userId, int page = 1, int pageSize = 20)
    {
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.UserId == userId);
        if (account == null)
        {
            throw new InvalidOperationException("No se encontró una cuenta asociada al usuario.");
        }

        return await _context.Transactions
            .Where(t => t.AccountId == account.Id)
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TransactionDto
            {
                Id = t.Id,
                AccountId = t.AccountId,
                Amount = t.Amount,
                Type = t.Type.ToString(),
                Description = t.Description,
                Date = t.CreatedAt,
                CounterpartAccountId = t.CounterpartAccountId,
                RelatedTransactionId = t.RelatedTransactionId
            })
            .ToListAsync();
    }

    // 6. ASEGURAR / CREAR CUENTA BANCARIA PARA USUARIO
    public async Task<AccountResponseDto> EnsureAccountForUserAsync(int userId)
    {
        var existingAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.UserId == userId);
        if (existingAccount != null)
        {
            return new AccountResponseDto
            {
                Id = existingAccount.Id,
                Balance = existingAccount.Balance,
                Currency = existingAccount.Currency,
                Alias = existingAccount.Alias,
                Cvu = existingAccount.Cvu,
                CreatedAt = existingAccount.CreatedAt
            };
        }

        var alias = await _aliasGenerator.GenerateUniqueAliasAsync();
        var cvu = await _cvuGenerator.GenerateUniqueCvuAsync();

        var account = new Account
        {
            UserId = userId,
            Balance = 0m,
            Currency = "ARS",
            Alias = alias,
            Cvu = cvu,
            CreatedAt = DateTime.UtcNow
        };

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();

        return new AccountResponseDto
        {
            Id = account.Id,
            Balance = account.Balance,
            Currency = account.Currency,
            Alias = account.Alias,
            Cvu = account.Cvu,
            CreatedAt = account.CreatedAt
        };
    }

    public async Task UpdateAliasAsync(int userId, string newAlias)
    {
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.UserId == userId);

        if (account == null)
        {
            throw new InvalidOperationException("Cuenta no encontrada.");
        }

        bool aliasEnUso = await _context.Accounts
            .AnyAsync(a => a.Alias == newAlias && a.Id != account.Id);

        if (aliasEnUso)
        {
            throw new ArgumentException("El alias ingresado ya se encuentra en uso por otra cuenta.");
        }

        account.Alias = newAlias;
        await _context.SaveChangesAsync();
    }

    // Helper privado para formato de destino
    private static (bool IsValid, bool IsCvu) ValidateDestinationFormat(string destination)
    {
        if (string.IsNullOrWhiteSpace(destination))
        {
            return (false, false);
        }

        if (System.Text.RegularExpressions.Regex.IsMatch(destination, @"^\d{22}$"))
        {
            return (true, true);
        }

        if (System.Text.RegularExpressions.Regex.IsMatch(destination, @"^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+){2}(\.[0-9]+)?$", System.Text.RegularExpressions.RegexOptions.IgnoreCase))
        {
            return (true, false);
        }

        return (false, false);
    }
}