namespace WalletApi.Dtos;

public class VirtualCard
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string CardNumber { get; set; } = string.Empty;
    public string ExpirationDate { get; set; } = string.Empty;
    public string Cvv { get; set; } = string.Empty;
    public bool IsFrozen { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}