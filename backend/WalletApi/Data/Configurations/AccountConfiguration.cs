using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WalletApi.Data.Entities;

namespace WalletApi.Data.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable("Accounts");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Balance).HasPrecision(18, 2).HasDefaultValue(0m);
        builder.Property(e => e.Currency).HasMaxLength(10).HasDefaultValue("ARS");
        builder.Property(e => e.Alias).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Cvu).HasMaxLength(22).IsUnicode(false).IsRequired();
        builder.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        //builder.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(e => e.Alias, "UQ_Accounts_Alias").IsUnique();
        builder.HasIndex(e => e.Cvu, "UQ_Accounts_Cvu").IsUnique();

        builder.HasOne(d => d.User)
            .WithMany(p => p.Accounts)
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("FK_Accounts_Users");
    }
}
