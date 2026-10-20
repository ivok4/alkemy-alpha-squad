using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace WalletApi.Data.Configurations;

public class IdentityRoleConfiguration : IEntityTypeConfiguration<IdentityRole<int>>
{
    public void Configure(EntityTypeBuilder<IdentityRole<int>> builder)
    {
        builder.HasData(
            new IdentityRole<int>
            {
                Id = 1,
                Name = "Usuario",
                NormalizedName = "USUARIO",
                ConcurrencyStamp = "seeded-role-usuario"
            }
        );
    }
}
