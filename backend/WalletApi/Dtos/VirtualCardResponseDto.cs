namespace WalletApi.Dtos;

public class VirtualCardResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string CardNumber { get; set; } = string.Empty;
    public string ExpirationDate { get; set; } = string.Empty;
    public string Cvv { get; set; } = string.Empty;
    public bool IsFrozen { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ToggleFreezeResponseDto
{
    public string Message { get; set; } = string.Empty;
    public bool IsFrozen { get; set; }
}