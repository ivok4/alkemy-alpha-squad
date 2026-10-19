using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WalletApi.Data.Entities;

namespace WalletApi.Data.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Message).HasMaxLength(500).IsRequired();
        builder.Property(e => e.Type).HasMaxLength(50).IsRequired();
        builder.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        //builder.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(d => d.User)
            .WithMany()
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("FK_Notifications_Users");

        builder.HasIndex(e => new { e.UserId, e.IsRead });
        builder.HasIndex(e => e.CreatedAt);
    }
}
