using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WalletApi.Data.Entities;

[Table("Notifications")]
public class Notification
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = "system"; // transfer_received, transfer_sent, deposit, system

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int? ReferenceId { get; set; }
}
