using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WalletApi.Data.Entities;

namespace WalletApi.Data.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable("Transactions");
        builder.HasKey(e => e.Id);

        // Relación con la Cuenta Titular (dueña del movimiento)
        builder.HasOne(t => t.Account)
            .WithMany(a => a.Transactions)
            .HasForeignKey(t => t.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relación con la Cuenta Contraparte
        builder.HasOne(t => t.CounterpartAccount)
            .WithMany()
            .HasForeignKey(t => t.CounterpartAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        // Autorreferencia: Movimiento Espejo
        builder.HasOne(t => t.RelatedTransaction)
            .WithMany()
            .HasForeignKey(t => t.RelatedTransactionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(e => e.Amount).HasPrecision(18, 2).IsRequired();
        builder.Property(e => e.Type)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();
        builder.Property(e => e.Description).HasMaxLength(255);
        builder.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        //builder.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
    }
}
