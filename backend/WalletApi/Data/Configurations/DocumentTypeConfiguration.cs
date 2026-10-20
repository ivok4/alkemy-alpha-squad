using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WalletApi.Data.Entities;

namespace WalletApi.Data.Configurations;

public class DocumentTypeConfiguration : IEntityTypeConfiguration<DocumentType>
{
    public void Configure(EntityTypeBuilder<DocumentType> builder)
    {
        builder.ToTable("document_types");
        builder.HasKey(e => e.Id);
        builder.HasIndex(e => e.Code).IsUnique();

        builder.Property(e => e.Id).HasColumnName("id");
        builder.Property(e => e.Code).HasMaxLength(10).IsUnicode(false).HasColumnName("code");
        builder.Property(e => e.Name).HasMaxLength(50).IsUnicode(false).HasColumnName("name");

        builder.HasData(
            new DocumentType { Id = 1, Code = "DNI", Name = "Documento Nacional de Identidad" },
            new DocumentType { Id = 2, Code = "PAS", Name = "Pasaporte" }
        );
    }
}
