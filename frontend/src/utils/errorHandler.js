/**
 * Diccionario de mensajes amigables para códigos de error estándar del backend.
 */
const ERROR_MESSAGES = {
  INSUFFICIENT_FUNDS: "No tienes saldo suficiente para realizar esta operación.",
  VALIDATION_ERROR: "Uno o más campos contienen errores. Por favor revisa el formulario.",
  NOT_FOUND: "El recurso solicitado no fue encontrado.",
  RESOURCE_NOT_FOUND: "El recurso solicitado no existe.",
  INVALID_ARGUMENT: "Los datos enviados son inválidos.",
  INVALID_OPERATION: "No se puede realizar esta operación en el estado actual.",
  CONFLICT: "Ya existe un registro con estos datos.",
  UNAUTHORIZED: "Tu sesión ha expirado o no tienes permisos para esta acción.",
  FORBIDDEN: "No tienes permisos suficientes para realizar esta acción.",
  INTERNAL_SERVER_ERROR: "Ocurrió un problema interno en el servidor. Por favor intenta más tarde.",
};

/**
 * Obtiene el código de error devuelto por la API (RFC 7807 o custom).
 * @param {any} error - Objeto de error capturado (Axios).
 * @returns {string|null}
 */
export function getErrorCode(error) {
  return (
    error?.response?.data?.errorCode ||
    error?.response?.data?.extensions?.errorCode ||
    null
  );
}

/**
 * Obtiene el mensaje legible del error devuelto por la API o un fallback amigable.
 * @param {any} error - Objeto de error (Axios o genérico).
 * @param {string} [defaultMessage] - Mensaje por defecto si no se encuentra ninguno.
 * @returns {string}
 */
export function getErrorMessage(error, defaultMessage = "Ocurrió un error inesperado. Intenta nuevamente.") {
  if (!error) return defaultMessage;

  // Si no hay conexión o se cayó el backend
  if (!error.response) {
    return "No se pudo establecer conexión con el servidor. Verifica tu conexión.";
  }

  const data = error.response.data;
  const errorCode = getErrorCode(error);

  // 1. Mensaje personalizado para el código de error si está registrado
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return data?.detail || ERROR_MESSAGES[errorCode];
  }

  // 2. Detalle estándar de RFC 7807 (ProblemDetails)
  if (data?.detail) {
    return data.detail;
  }

  // 3. Propiedad message clásica
  if (data?.message) {
    return data.message;
  }

  // 4. Errores de validación de ModelState
  if (data?.errors && typeof data.errors === "object") {
    const firstKey = Object.keys(data.errors)[0];
    if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length > 0) {
      return data.errors[firstKey][0];
    }
  }

  // 5. Title del ProblemDetails
  if (data?.title) {
    return data.title;
  }

  // Fallbacks por status HTTP
  switch (error.response.status) {
    case 400:
      return "La solicitud contiene datos inválidos.";
    case 401:
      return "Sesión expirada o no autorizada.";
    case 403:
      return "No tienes permisos para realizar esta acción.";
    case 404:
      return "El recurso solicitado no fue encontrado.";
    case 409:
      return "Hubo un conflicto al procesar la solicitud.";
    case 500:
      return "Ocurrió un error en el servidor. Intenta nuevamente más tarde.";
    default:
      return defaultMessage;
  }
}

/**
 * Extrae el mapa de errores de validación por campo (útil para formularios).
 * @param {any} error
 * @returns {Record<string, string[]>}
 */
export function getFieldErrors(error) {
  if (error?.response?.data?.errors && typeof error.response.data.errors === "object") {
    return error.response.data.errors;
  }
  return {};
}

/**
 * Parsea completamente un error de la API en un objeto estructurado y fácil de usar.
 * @param {any} error
 * @returns {{
 *   errorCode: string|null,
 *   message: string,
 *   fieldErrors: Record<string, string[]>,
 *   status: number|null,
 *   isNetworkError: boolean
 * }}
 */
export function parseApiError(error) {
  const isNetworkError = !error?.response;
  const status = error?.response?.status || null;
  const errorCode = getErrorCode(error);
  const message = getErrorMessage(error);
  const fieldErrors = getFieldErrors(error);

  return {
    errorCode,
    message,
    fieldErrors,
    status,
    isNetworkError,
  };
}

export default {
  getErrorCode,
  getErrorMessage,
  getFieldErrors,
  parseApiError,
};
