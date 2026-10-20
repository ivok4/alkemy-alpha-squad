using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WalletApi.Dtos;
using WalletApi.Interfaces;

namespace WalletApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    /// <summary>
    /// Obtiene las notificaciones del usuario autenticado ordenadas de forma cronológica descendente.
    /// </summary>
    /// <param name="page">Número de página (por defecto: 1).</param>
    /// <param name="pageSize">Tamaño de página (por defecto: 50).</param>
    /// <response code="200">Listado de notificaciones y conteo de no leídas.</response>
    /// <response code="401">Usuario no autenticado.</response>
    [HttpGet]
    [ProducesResponseType(typeof(NotificationListResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<NotificationListResponseDto>> GetMyNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var userId = GetCurrentUserId();
        var result = await _notificationService.GetUserNotificationsAsync(userId, page, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Obtiene el conteo de notificaciones no leídas del usuario autenticado para actualizar la badge/globito.
    /// </summary>
    /// <response code="200">Cantidad de notificaciones pendientes de lectura.</response>
    /// <response code="401">Usuario no autenticado.</response>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(UnreadCountResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UnreadCountResponseDto>> GetUnreadCount()
    {
        var userId = GetCurrentUserId();
        var count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(new UnreadCountResponseDto { UnreadCount = count });
    }

    /// <summary>
    /// Marca una notificación específica como leída al hacerle clic.
    /// </summary>
    /// <param name="id">Identificador único de la notificación.</param>
    /// <response code="200">Notificación marcada como leída exitosamente.</response>
    /// <response code="401">Usuario no autenticado.</response>
    /// <response code="404">Notificación no encontrada o no pertenece al usuario.</response>
    [HttpPatch("{id:int}/read")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = GetCurrentUserId();
        await _notificationService.MarkAsReadAsync(userId, id);
        return Ok(new { message = "Notificación marcada como leída.", id });
    }

    /// <summary>
    /// Marca todas las notificaciones del usuario autenticado como leídas.
    /// </summary>
    /// <response code="200">Todas las notificaciones fueron marcadas como leídas.</response>
    /// <response code="401">Usuario no autenticado.</response>
    [HttpPatch("read-all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();
        var updatedCount = await _notificationService.MarkAllAsReadAsync(userId);
        return Ok(new { message = "Todas las notificaciones fueron marcadas como leídas.", updatedCount });
    }

    /// <summary>
    /// Elimina una notificación específica del usuario autenticado.
    /// </summary>
    /// <param name="id">Identificador de la notificación a eliminar.</param>
    /// <response code="200">Notificación eliminada exitosamente.</response>
    /// <response code="401">Usuario no autenticado.</response>
    /// <response code="404">Notificación no encontrada.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetCurrentUserId();
        await _notificationService.DeleteNotificationAsync(userId, id);
        return Ok(new { message = "Notificación eliminada exitosamente.", id });
    }

    /// <summary>
    /// Elimina todas las notificaciones del usuario autenticado para vaciar su bandeja.
    /// </summary>
    /// <response code="200">Todas las notificaciones fueron eliminadas.</response>
    /// <response code="401">Usuario no autenticado.</response>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ClearAll()
    {
        var userId = GetCurrentUserId();
        var deletedCount = await _notificationService.ClearAllNotificationsAsync(userId);
        return Ok(new { message = "Todas las notificaciones han sido eliminadas.", deletedCount });
    }

    private int GetCurrentUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
        {
            throw new UnauthorizedAccessException("Usuario no autenticado.");
        }

        return userId;
    }
}
