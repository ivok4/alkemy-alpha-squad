# Manejo Unificado de Errores - DigitalArs API

Este documento especifica el estándar de respuestas de error de la API y cómo consumirlos tanto en el **Backend (.NET 10)** como en el **Frontend (React)**.

---

## 1. Formato Estándar de Respuesta (RFC 7807 - ProblemDetails)

Todas las respuestas de error devueltas por la API tienen el `Content-Type: application/problem+json` y siguen la siguiente estructura:

```json
{
  "type": "https://httpstatuses.io/400",
  "title": "Petición incorrecta",
  "status": 400,
  "detail": "Saldo insuficiente para realizar la transferencia.",
  "instance": "/api/Transactions/transfer",
  "errorCode": "INSUFFICIENT_FUNDS",
  "timestamp": "2026-09-24T11:00:00.000Z",
  "traceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00"
}
```

### Formato para Errores de Validación (ModelState):

Cuando falla la validación de un DTO (ej. `[Required]`, `[Range]`, etc.), se devuelve un objeto `errors` con el detalle por campo afectado:

```json
{
  "type": "https://httpstatuses.io/400",
  "title": "Error de validación",
  "status": 400,
  "detail": "Uno o más campos contienen errores de validación.",
  "instance": "/api/account/deposit",
  "errorCode": "VALIDATION_ERROR",
  "errors": {
    "amount": [
      "El campo amount es obligatorio.",
      "El monto debe ser mayor a cero."
    ]
  },
  "timestamp": "2026-09-24T11:00:00.000Z"
}
```

---

## 2. Catálogo de Códigos de Error (`errorCode`)

| `errorCode` | HTTP Status | Descripción | Cuándo se utiliza |
|---|---|---|---|
| `INSUFFICIENT_FUNDS` | `400 Bad Request` | Saldo insuficiente | El usuario intenta transferir o extraer más saldo del disponible. |
| `VALIDATION_ERROR` | `400 Bad Request` | Error de validación | Fallo en las DataAnnotations del DTO (campos requeridos, formato, etc.). |
| `INVALID_ARGUMENT` | `400 Bad Request` | Parámetro inválido | El formato de CVU, Alias o datos enviados no cumple las reglas. |
| `INVALID_OPERATION` | `400 Bad Request` | Operación inválida | Intentar transferirse a uno mismo o usuario inactivo. |
| `NOT_FOUND` / `RESOURCE_NOT_FOUND` | `404 Not Found` | Recurso no encontrado | La cuenta, usuario o transacción solicitada no existe. |
| `UNAUTHORIZED` | `401 Unauthorized` | No autenticado | Token JWT ausente, inválido o expirado. |
| `FORBIDDEN` | `403 Forbidden` | Acceso denegado | El usuario autenticado no posee el rol necesario (ej. no es Admin). |
| `CONFLICT` | `409 Conflict` | Conflicto de estado | El email o identificador ya se encuentra registrado. |
| `INTERNAL_SERVER_ERROR` | `500 Internal Server Error` | Error de servidor | Excepciones no controladas. **Nunca expone stack traces ni connection strings.** |

---

## 3. Uso en el Backend (C# / .NET 10)

### Lanzar Excepciones de Negocio
Puedes lanzar cualquiera de las excepciones tipadas desde tus servicios sin necesidad de hacer `try/catch` manual en cada controlador:

```csharp
using WalletApi.Exceptions;

// Saldo insuficiente
throw new InsufficientFundsException("Saldo insuficiente para realizar la transferencia.");

// Recurso no encontrado
throw new NotFoundException("No se encontró la cuenta con el CVU indicado.");

// Error de validación o conflicto personalizado
throw new ConflictException("El email ya se encuentra registrado.");

// Excepción genérica de aplicación con código custom
throw new AppException("Mensaje personalizado", "CODIGO_CUSTOM", StatusCodes.Status400BadRequest);
```

---

## 4. Consumo en el Frontend (React)

### Opción A: Comprobación directa por `errorCode`
```javascript
try {
  await accountService.transfer(destination, amount);
} catch (error) {
  if (error.response?.data?.errorCode === "INSUFFICIENT_FUNDS") {
    // Mostrar mensaje específico para fondos insuficientes
    setErrorMessage("No cuentas con saldo suficiente para completar esta transferencia.");
  } else if (error.response?.data?.errorCode === "VALIDATION_ERROR") {
    // Errores de validación por campo
    const fieldErrors = error.response.data.errors;
    console.log("Campos inválidos:", fieldErrors);
  } else {
    // Mensaje genérico o devuelto por la API
    setErrorMessage(error.response?.data?.detail || "Ocurrió un error inesperado.");
  }
}
```

### Opción B: Usando el helper utilitario `errorHandler.js`
```javascript
import { parseApiError, getErrorMessage } from "../utils/errorHandler";

try {
  await accountService.transfer(destination, amount);
} catch (error) {
  const { errorCode, message, fieldErrors } = parseApiError(error);

  if (errorCode === "INSUFFICIENT_FUNDS") {
    // Manejo específico
  }

  // message ya contiene el texto amigable formateado automáticamente
  setErrorMessage(message);
}
```
