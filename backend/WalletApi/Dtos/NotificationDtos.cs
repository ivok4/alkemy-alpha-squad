namespace WalletApi.Dtos;

public class NotificationDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? ReferenceId { get; set; }
}

public class NotificationListResponseDto
{
    public int Total { get; set; }
    public int UnreadCount { get; set; }
    public List<NotificationDto> Notifications { get; set; } = new();
}

public class UnreadCountResponseDto
{
    public int UnreadCount { get; set; }
}
