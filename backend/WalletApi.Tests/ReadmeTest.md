# Reglas Críticas del Servicio de Transferencias

Tests unitarios `WalletApi.Tests` con xUnit, Moq, FluentAssertions y SQLite In-Memory para validar de forma automatizada y reproducible todas las reglas de negocio críticas del servicio de transferencias (AccountService.cs).


### 1. Saldo Insuficiente

- **`TransferAsync_ShouldThrowInsufficientFundsException_WhenAmountExceedsBalance`**: Lanza `InsufficientFundsException` y verifica que los saldos queden intactos si el monto solicitado excede el saldo de la cuenta origen.

### 2. Importe Inválido

- **`TransferAsync_ShouldThrowArgumentException_WhenAmountIsZeroOrNegative`**: Valida montos <= 0 (`0`, `-50`, `-0.01`).
- **`TransferAsync_ShouldThrowArgumentException_WhenAmountHasMoreThanTwoDecimals`**: Valida montos con más de 2 decimales (`10.555`, `100.1234`, `0.001`).

### 3. Cuenta Destino Inexistente / Inactiva

- **`TransferAsync_ShouldThrowKeyNotFoundException_WhenDestinationCvuDoesNotExist`**: Valida CVU inexistente.
- **`TransferAsync_ShouldThrowKeyNotFoundException_WhenDestinationAliasDoesNotExist`**: Valida Alias inexistente.
- **`TransferAsync_ShouldThrowArgumentException_WhenDestinationFormatIsInvalid`**: Valida formatos corruptos de Alias o CVU.
- **`TransferAsync_ShouldThrowInvalidOperationException_WhenTargetUserIsInactive`**: Bloquea transferencias hacia usuarios inactivos (`IsActive == false`).

### 4. Transferencia a la Propia Cuenta

- **`TransferAsync_ShouldThrowInvalidOperationException_WhenTransferringToOwnAlias`**: Impide autoreferencias por Alias.
- **`TransferAsync_ShouldThrowInvalidOperationException_WhenTransferringToOwnCvu`**: Impide autoreferencias por CVU.

### 5. Atomicidad ante Error Simulado (Rollback)

- **`TransferAsync_ShouldRollbackAndPreserveBalances_WhenFailureOccursDuringTransaction`**: Simula una caída/excepción de base de datos durante la persistencia de transacciones, comprobando que se ejecuta el `Rollback`, los saldos quedan exactamente iguales y no se guardan transacciones huérfanas.

### 6. Flujo Exitoso (Happy Path)

- **`TransferAsync_ShouldSuccessfullyTransferFunds_WhenDataIsValid`**: Verifica débito de origen, crédito de destino, creación de transacciones vinculadas y envío de notificaciones.

## Cómo Ejecutar los Tests

Desde la raíz o desde la carpeta `backend`:

```powershell
dotnet test backend/WalletApi.Tests/WalletApi.Tests.csproj
```

O corriendo la solución completa:

```powershell
dotnet test backend/Wallet.slnx
```
