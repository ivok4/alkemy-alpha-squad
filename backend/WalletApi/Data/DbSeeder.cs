using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WalletApi.Data.Entities;
using WalletApi.Interfaces;
using WalletApi.Models;

namespace WalletApi.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(
        WalletContext context,
        RoleManager<IdentityRole<int>> roleManager,
        UserManager<User> userManager,
        IConfiguration configuration,
        IAccountService accountService,
        ILogger logger)
    {
        Console.WriteLine("[SEEDER] ===== Iniciando proceso de Seeding =====");

        // 1. Asegurar Tipos de Documento (Requerido para la FK de Users)
        var dniDoc = await context.DocumentTypes.FirstOrDefaultAsync(d => d.Code == "DNI");
        if (dniDoc == null)
        {
            dniDoc = new DocumentType { Code = "DNI", Name = "Documento Nacional de Identidad" };
            context.DocumentTypes.Add(dniDoc);
            if (!await context.DocumentTypes.AnyAsync(d => d.Code == "PAS"))
            {
                context.DocumentTypes.Add(new DocumentType { Code = "PAS", Name = "Pasaporte" });
            }
            await context.SaveChangesAsync();
            Console.WriteLine("[SEEDER] Tipos de documento creados (DNI, PAS).");
            logger.LogInformation("Tipos de documento (DNI, PAS) inicializados con éxito.");
        }
        else
        {
            Console.WriteLine($"[SEEDER] Tipo de documento DNI existente: Id={dniDoc.Id}");
        }

        // 2. Ensure roles
        string[] roles = ["Usuario", "Administrador"];

        foreach (var roleName in roles)
        {
            var exists = await roleManager.RoleExistsAsync(roleName);
            if (!exists)
            {
                var role = new IdentityRole<int>(roleName);
                var result = await roleManager.CreateAsync(role);
                if (!result.Succeeded)
                {
                    var roleErrors = string.Join(", ", result.Errors.Select(e => $"{e.Code}: {e.Description}"));
                    Console.WriteLine($"[SEEDER ERROR] Error al crear rol {roleName}: {roleErrors}");
                    logger.LogError("Error creating role {RoleName}: {Errors}", roleName, roleErrors);
                }
                else
                {
                    Console.WriteLine($"[SEEDER] Rol creado: {roleName}");
                }
            }
        }

        // 3. Read Admin credentials from IConfiguration (appsettings.json or environment variables / secrets)
        var adminEmail = configuration["AdminUser:Email"];
        var adminPassword = configuration["AdminUser:Password"];

        if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("[SEEDER WARNING] No se configuraron credenciales para AdminUser en IConfiguration.");
            Console.ResetColor();
            logger.LogWarning("No se configuraron credenciales para AdminUser en IConfiguration. Se omite la creación del administrador.");
            return;
        }

        Console.WriteLine($"[SEEDER] Verificando usuario administrador: {adminEmail}...");

        // 4. Ensure admin user exists
        var admin = await userManager.FindByEmailAsync(adminEmail);
        if (admin == null)
        {
            Console.WriteLine("[SEEDER] El usuario admin no existe. Creando nuevo registro...");
            var adminUser = new User
            {
                UserName = adminEmail,
                Email = adminEmail,
                NormalizedUserName = adminEmail.ToUpperInvariant(),
                NormalizedEmail = adminEmail.ToUpperInvariant(),
                EmailConfirmed = true,
                FirstName = "Admin",
                LastName = "User",
                DocumentTypeId = dniDoc.Id,
                DocumentNumber = "00000000",
                IsActive = true,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            var createResult = await userManager.CreateAsync(adminUser, adminPassword);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(e => $"{e.Code}: {e.Description}"));
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"[SEEDER ERROR] Falló userManager.CreateAsync para {adminEmail}: {errors}");
                Console.ResetColor();
                logger.LogError("Error al crear usuario admin: {Errors}", errors);
                return;
            }

            var addToRole = await userManager.AddToRoleAsync(adminUser, "Administrador");
            if (!addToRole.Succeeded)
            {
                var roleErrors = string.Join(", ", addToRole.Errors.Select(e => $"{e.Code}: {e.Description}"));
                Console.WriteLine($"[SEEDER WARNING] Error al asociar rol Administrador: {roleErrors}");
                logger.LogError("Error adding admin user to role: {Errors}", roleErrors);
            }

            admin = adminUser;
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"[SEEDER SUCCESS] Usuario administrador creado con éxito! (Id={admin.Id}, Email={adminEmail})");
            Console.ResetColor();
            logger.LogInformation("Usuario administrador creado con éxito para {Email}.", adminEmail);
        }
        else
        {
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine($"[SEEDER INFO] El usuario admin ya existe en AspNetUsers (Id={admin.Id}, Email={admin.Email}).");
            Console.ResetColor();

            admin.IsActive = true;
            admin.EmailConfirmed = true;
            admin.NormalizedEmail = adminEmail.ToUpperInvariant();
            admin.NormalizedUserName = adminEmail.ToUpperInvariant();
            admin.SecurityStamp ??= Guid.NewGuid().ToString();
            admin.PasswordHash = userManager.PasswordHasher.HashPassword(admin, adminPassword);

            await userManager.UpdateAsync(admin);

            if (!await userManager.IsInRoleAsync(admin, "Administrador"))
            {
                await userManager.AddToRoleAsync(admin, "Administrador");
            }

            logger.LogInformation("Usuario administrador actualizado con éxito para {Email}.", adminEmail);
        }

        // 5. Ensure admin has an active bank account (delegated to IAccountService)
        try
        {
            var account = await accountService.EnsureAccountForUserAsync(admin.Id);
            Console.WriteLine($"[SEEDER] Cuenta bancaria lista. Alias: {account.Alias}, CVU: {account.Cvu}");
            logger.LogInformation("Cuenta bancaria del administrador lista. Alias: {Alias}, CVU: {Cvu}", account.Alias, account.Cvu);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SEEDER ERROR] Error al crear cuenta bancaria: {ex.Message}");
            logger.LogError(ex, "Error al asegurar la cuenta bancaria del administrador ({Email}).", adminEmail);
        }

        Console.WriteLine("[SEEDER] ===== Seeding finalizado con éxito =====");
    }
}
