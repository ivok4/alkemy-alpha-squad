using Microsoft.AspNetCore.Identity;

namespace WalletApi.Data.Entities;

public class User : IdentityUser<int>
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public int DocumentTypeId { get; set; }

    public string DocumentNumber { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual DocumentType? DocumentType { get; set; }
    public bool IsActive { get; set; } = true;
    public bool DebeCambiarPassword { get; set; } = false;
    public virtual ICollection<Account> Accounts { get; set; } = new List<Account>();
}
