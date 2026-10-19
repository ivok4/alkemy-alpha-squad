using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VirtualCardEntity = WalletApi.Data.Entities.VirtualCard;

namespace WalletApi.Data.Configurations;

public class VirtualCardConfiguration : IEntityTypeConfiguration<VirtualCardEntity>
{
    public void Configure(EntityTypeBuilder<VirtualCardEntity> builder)
    {
        builder.ToTable("VirtualCards");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.CardNumber).HasMaxLength(16).IsRequired();
        builder.Property(e => e.ExpirationDate).HasMaxLength(5).IsRequired();
        builder.Property(e => e.Cvv).HasMaxLength(3).IsRequired();
        builder.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        //builder.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
