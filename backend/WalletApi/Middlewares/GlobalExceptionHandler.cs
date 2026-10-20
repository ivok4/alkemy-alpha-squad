using System.Diagnostics;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using WalletApi.Exceptions;

namespace WalletApi.Middlewares;

/// <summary>
/// Manejador global de excepciones estandarizado según RFC 7807 (ProblemDetails).
/// Captura errores controlados y no controlados sin exponer información sensible.
/// </summary>
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        int statusCode;
        string errorCode;
        string title;
        string detail;

        switch (exception)
        {
            case AppException appEx:
                statusCode = appEx.StatusCode;
                errorCode = appEx.ErrorCode;
                title = GetTitleForStatusCode(statusCode);
                detail = appEx.Message;
                _logger.LogWarning("Controlled AppException ({ErrorCode}): {Message} on path {Path}",
                    errorCode, detail, httpContext.Request.Path);
                break;

            case KeyNotFoundException keyEx:
                statusCode = StatusCodes.Status404NotFound;
                errorCode = "NOT_FOUND";
                title = "Recurso no encontrado";
                detail = keyEx.Message;
                _logger.LogWarning("Resource not found: {Message} on path {Path}", detail, httpContext.Request.Path);
                break;

            case ArgumentException argEx:
                statusCode = StatusCodes.Status400BadRequest;
                errorCode = "INVALID_ARGUMENT";
                title = "Parámetro inválido";
                detail = argEx.Message;
                _logger.LogWarning("Invalid argument: {Message} on path {Path}", detail, httpContext.Request.Path);
                break;

            case InvalidOperationException invEx:
                statusCode = StatusCodes.Status400BadRequest;
                errorCode = "INVALID_OPERATION";
                title = "Operación inválida";
                detail = invEx.Message;
                _logger.LogWarning("Invalid operation: {Message} on path {Path}", detail, httpContext.Request.Path);
                break;

            case UnauthorizedAccessException unauthEx:
                statusCode = StatusCodes.Status401Unauthorized;
                errorCode = "UNAUTHORIZED";
                title = "No autorizado";
                detail = string.IsNullOrWhiteSpace(unauthEx.Message)
                    ? "No tiene autorización para realizar esta solicitud."
                    : unauthEx.Message;
                _logger.LogWarning("Unauthorized access: {Message} on path {Path}", detail, httpContext.Request.Path);
                break;

            default:
                // Error no controlado: Registrar detalles completos en logs pero NUNCA exponerlos al cliente
                statusCode = StatusCodes.Status500InternalServerError;
                errorCode = "INTERNAL_SERVER_ERROR";
                title = "Error interno del servidor";
                detail = "Ha ocurrido un error inesperado en el servidor. Por favor, intente nuevamente más tarde.";

                _logger.LogError(exception, "Unhandled Exception: {Message} on path {Path}",
                    exception.Message, httpContext.Request.Path);
                break;
        }

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path,
            Type = $"https://httpstatuses.io/{statusCode}"
        };

        // Extensiones estándar (incluyendo errorCode para que el frontend pueda comprobarlo)
        problemDetails.Extensions["errorCode"] = errorCode;
        problemDetails.Extensions["timestamp"] = DateTime.UtcNow;

        var traceId = Activity.Current?.Id ?? httpContext.TraceIdentifier;
        if (!string.IsNullOrEmpty(traceId))
        {
            problemDetails.Extensions["traceId"] = traceId;
        }

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/problem+json";

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }

    private static string GetTitleForStatusCode(int statusCode) => statusCode switch
    {
        StatusCodes.Status400BadRequest => "Petición incorrecta",
        StatusCodes.Status401Unauthorized => "No autenticado",
        StatusCodes.Status403Forbidden => "Acceso prohibido",
        StatusCodes.Status404NotFound => "Recurso no encontrado",
        StatusCodes.Status409Conflict => "Conflicto de estado",
        StatusCodes.Status422UnprocessableEntity => "Entidad no procesable",
        _ => "Error en la solicitud"
    };
}
