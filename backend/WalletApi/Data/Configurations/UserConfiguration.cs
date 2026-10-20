using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WalletApi.Data.Entities;

namespace WalletApi.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(e => e.FirstName).HasMaxLength(50).IsRequired();
        builder.Property(e => e.LastName).HasMaxLength(50).IsRequired();
        builder.Property(e => e.DocumentNumber).HasMaxLength(30).IsUnicode(false).IsRequired();
        builder.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        //builder.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(e => new { e.DocumentTypeId, e.DocumentNumber }, "UQ_User_DocumentType_Number").IsUnique();

        builder.HasOne(d => d.DocumentType)
            .WithMany(p => p.Users)
            .HasForeignKey(d => d.DocumentTypeId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_Users_DocumentTypes");
    }
}
