using WalletApi.Dtos;

namespace WalletApi.Interfaces;

public interface INotificationService
{
    Task<NotificationDto> CreateNotificationAsync(int userId, string title, string message, string type, int? referenceId = null);
    Task<NotificationListResponseDto> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 50);
    Task<int> GetUnreadCountAsync(int userId);
    Task<bool> MarkAsReadAsync(int userId, int notificationId);
    Task<int> MarkAllAsReadAsync(int userId);
    Task<bool> DeleteNotificationAsync(int userId, int notificationId);
    Task<int> ClearAllNotificationsAsync(int userId);
}
