using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WalletApi.Data.Entities;
namespace WalletApi.Models;

public class WalletContext : IdentityDbContext<User, IdentityRole<int>, int>
{
    public WalletContext(DbContextOptions<WalletContext> options)
        : base(options)
    {
    }


    public virtual DbSet<Account> Accounts { get; set; } = null!;
    public virtual DbSet<DocumentType> DocumentTypes { get; set; } = null!;
    public virtual DbSet<Transaction> Transactions { get; set; } = null!;
    public virtual DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<VirtualCard> VirtualCards { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(WalletContext).Assembly);
    }
}
