using Microsoft.EntityFrameworkCore;
using WalletApi.Data.Entities;
using WalletApi.Dtos;
using WalletApi.Exceptions;
using WalletApi.Interfaces;
using WalletApi.Models;

namespace WalletApi.Services;

public class NotificationService : INotificationService
{
    private readonly WalletContext _context;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(WalletContext context, ILogger<NotificationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<NotificationDto> CreateNotificationAsync(
        int userId,
        string title,
        string message,
        string type,
        int? referenceId = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            ReferenceId = referenceId
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Notification created for user {UserId}: {Title}", userId, title);

        return new NotificationDto
        {
            Id = notification.Id,
            UserId = notification.UserId,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
            ReferenceId = notification.ReferenceId
        };
    }

    public async Task<NotificationListResponseDto> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 50)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 50;

        var baseQuery = _context.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId);

        var total = await baseQuery.CountAsync();
        var unreadCount = await baseQuery.CountAsync(n => !n.IsRead);

        var notifications = await baseQuery
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                ReferenceId = n.ReferenceId
            })
            .ToListAsync();

        return new NotificationListResponseDto
        {
            Total = total,
            UnreadCount = unreadCount,
            Notifications = notifications
        };
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _context.Notifications
            .AsNoTracking()
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task<bool> MarkAsReadAsync(int userId, int notificationId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null)
        {
            throw new NotFoundException("Notificación no encontrada.");
        }

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            await _context.SaveChangesAsync();
        }

        return true;
    }

    public async Task<int> MarkAllAsReadAsync(int userId)
    {
        var updatedRows = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(setter => setter.SetProperty(n => n.IsRead, true));

        return updatedRows;
    }

    public async Task<bool> DeleteNotificationAsync(int userId, int notificationId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null)
        {
            throw new NotFoundException("Notificación no encontrada.");
        }

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<int> ClearAllNotificationsAsync(int userId)
    {
        var deletedCount = await _context.Notifications
            .Where(n => n.UserId == userId)
            .ExecuteDeleteAsync();

        return deletedCount;
    }
}
