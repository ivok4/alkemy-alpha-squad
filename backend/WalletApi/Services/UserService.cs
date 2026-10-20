using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WalletApi.Data.Entities;
using WalletApi.Dtos;
using WalletApi.Interfaces;
using WalletApi.Models;

namespace WalletApi.Services;

public class UserService(
    WalletContext walletContext,
    UserManager<User> userManager,
    RoleManager<IdentityRole<int>> roleManager,
    IAliasGeneratorService aliasGenerator,
    ICvuGeneratorService cvuGenerator) : IUserService
{
    private readonly WalletContext _context = walletContext;
    private readonly UserManager<User> _userManager = userManager;
    private readonly RoleManager<IdentityRole<int>> _roleManager = roleManager;
    private readonly IAliasGeneratorService _aliasGenerator = aliasGenerator;
    private readonly ICvuGeneratorService _cvuGenerator = cvuGenerator;

    public IReadOnlyList<User> ObtenerTodas()
    {
        return _context.Users.ToList();
    }

    public async Task<PagedUsersResponseDto> ObtenerUsuariosPaginadosAsync(int pagina, int porPagina)
    {
        var query = from user in _context.Users.Include(u => u.DocumentType).AsNoTracking()
                    join userRole in _context.UserRoles on user.Id equals userRole.UserId
                    join role in _context.Roles on userRole.RoleId equals role.Id
                    where role.NormalizedName == "USUARIO"
                    where !_context.UserRoles.Any(ur => ur.UserId == user.Id && _context.Roles.Any(r => r.Id == ur.RoleId && r.NormalizedName == "ADMINISTRADOR"))
                    select user;

        var totalRegistros = await query.CountAsync();
        var totalPaginas = (int)Math.Ceiling(totalRegistros / (double)porPagina);

        var usuarios = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pagina - 1) * porPagina)
            .Take(porPagina)
            .Select(u => new UserListItemDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email ?? string.Empty,
                DocumentType = u.DocumentType != null ? u.DocumentType.Code : string.Empty,
                DocumentNumber = u.DocumentNumber,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                Role = "Usuario"
            })
            .ToListAsync();

        return new PagedUsersResponseDto
        {
            TotalRegistros = totalRegistros,
            PaginaActual = pagina,
            PorPagina = porPagina,
            TotalPaginas = totalPaginas,
            Usuarios = usuarios
        };
    }

    public User? ObtenerPorId(int id)
    {
        return _context.Users.FirstOrDefault(u => u.Id == id);
    }

    public User? ObtenerPorEmail(string email)
    {
        return _context.Users.FirstOrDefault(u => u.Email == email);
    }

    public async Task<UserDetailResponseDto?> ObtenerDetallePorIdAsync(int id)
    {
        var user = await _context.Users
            .Include(u => u.DocumentType)
            .Include(u => u.Accounts)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return null;

        var role = await (from ur in _context.UserRoles
                          join r in _context.Roles on ur.RoleId equals r.Id
                          where ur.UserId == user.Id
                          select r.Name).FirstOrDefaultAsync() ?? "Usuario";

        var account = user.Accounts.FirstOrDefault();

        return new UserDetailResponseDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email ?? string.Empty,
            DocumentType = user.DocumentType != null ? user.DocumentType.Code : string.Empty,
            DocumentNumber = user.DocumentNumber,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            Role = role,
            Account = account != null ? new AccountResponseDto
            {
                Id = account.Id,
                Cvu = account.Cvu,
                Alias = account.Alias,
                Balance = account.Balance,
                Currency = account.Currency,
                CreatedAt = account.CreatedAt
            } : null
        };
    }

    public async Task<UserDetailResponseDto> CrearUsuarioPorAdminAsync(CreateUserAdminRequestDto request)
    {
        // 1. Validar existencia de Tipo de Documento
        var documentType = await _context.DocumentTypes
            .FirstOrDefaultAsync(d => d.Id == request.DocumentTypeId);

        if (documentType == null)
        {
            throw new ArgumentException("El tipo de documento especificado no existe.");
        }

        // 2. Validar formato según tipo
        var normalizedDocNumber = request.DocumentNumber.Trim().ToUpperInvariant();
        ValidateDocumentNumber(documentType.Code, normalizedDocNumber);

        // 3. Validar email único
        var existingUserByEmail = await _userManager.FindByEmailAsync(request.Email.Trim());
        if (existingUserByEmail != null)
        {
            throw new InvalidOperationException("El email ya está en uso.");
        }

        // 4. Validar combinación tipo + número de documento única
        var existingUserByDoc = await _context.Users
            .AnyAsync(u => u.DocumentTypeId == request.DocumentTypeId && u.DocumentNumber == normalizedDocNumber);

        if (existingUserByDoc)
        {
            throw new InvalidOperationException("Ya existe un usuario con este tipo y número de documento.");
        }

        // 5. Asegurar rol Usuario
        const string defaultRole = "Usuario";
        if (!await _roleManager.RoleExistsAsync(defaultRole))
        {
            await _roleManager.CreateAsync(new IdentityRole<int>(defaultRole)
            {
                NormalizedName = defaultRole.ToUpperInvariant()
            });
        }

        // 6. Crear usuario y cuenta en transacción
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var user = new User
            {
                UserName = request.Email.Trim(),
                Email = request.Email.Trim(),
                NormalizedUserName = request.Email.Trim().ToUpperInvariant(),
                NormalizedEmail = request.Email.Trim().ToUpperInvariant(),
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                DocumentTypeId = request.DocumentTypeId,
                DocumentNumber = normalizedDocNumber,
                IsActive = true,
                DebeCambiarPassword = true,
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString(),
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                throw new ArgumentException($"Error al registrar el usuario: {errors}");
            }

            var roleResult = await _userManager.AddToRoleAsync(user, defaultRole);
            if (!roleResult.Succeeded)
            {
                var errors = string.Join("; ", roleResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Error al asignar el rol: {errors}");
            }

            var alias = await _aliasGenerator.GenerateUniqueAliasAsync();
            var cvu = await _cvuGenerator.GenerateUniqueCvuAsync();

            var account = new Account
            {
                UserId = user.Id,
                Balance = 0m,
                Currency = "ARS",
                Alias = alias,
                Cvu = cvu,
                CreatedAt = DateTime.UtcNow
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return new UserDetailResponseDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                DocumentType = documentType.Code,
                DocumentNumber = user.DocumentNumber,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                Role = defaultRole,
                Account = new AccountResponseDto
                {
                    Id = account.Id,
                    Cvu = account.Cvu,
                    Alias = account.Alias,
                    Balance = account.Balance,
                    Currency = account.Currency,
                    CreatedAt = account.CreatedAt
                }
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static void ValidateDocumentNumber(string docTypeCode, string docNumber)
    {
        switch (docTypeCode.ToUpperInvariant())
        {
            case "DNI":
                if (!Regex.IsMatch(docNumber, @"^\d{7,8}$"))
                {
                    throw new ArgumentException("El DNI debe ser numérico y tener entre 7 y 8 dígitos.");
                }
                break;

            case "PAS":
                if (!Regex.IsMatch(docNumber, @"^(?:[A-Z]{3}\d{6}|[A-Z0-9]{6,12})$"))
                {
                    throw new ArgumentException("El Pasaporte debe tener un formato válido (ej. 3 letras seguidas de 6 números o alfanumérico de 6 a 12 caracteres).");
                }
                break;

            default:
                if (string.IsNullOrWhiteSpace(docNumber) || docNumber.Length < 4 || docNumber.Length > 30)
                {
                    throw new ArgumentException("Longitud de número de documento inválida.");
                }
                break;
        }
    }

    public async Task<UserDetailResponseDto> ActualizarUsuarioPorAdminAsync(int id, UpdateUserAdminRequestDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
        {
            throw new KeyNotFoundException($"No se encontró el usuario con ID {id}.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Contains("Administrador"))
        {
            throw new InvalidOperationException("Solo se pueden actualizar datos de usuarios con rol 'Usuario'.");
        }

        var normalizedEmail = request.Email.Trim().ToUpperInvariant();
        if (!string.Equals(user.NormalizedEmail, normalizedEmail, StringComparison.OrdinalIgnoreCase))
        {
            var emailExists = await _context.Users.AnyAsync(u => u.Id != id && u.NormalizedEmail == normalizedEmail);
            if (emailExists)
            {
                throw new InvalidOperationException("el email ya esta en uso");
            }

            user.Email = request.Email.Trim();
            user.NormalizedEmail = normalizedEmail;
            user.UserName = request.Email.Trim();
            user.NormalizedUserName = normalizedEmail;
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var errors = string.Join("; ", updateResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Error al actualizar el usuario: {errors}");
        }

        var userDetail = await ObtenerDetallePorIdAsync(id);
        if (userDetail == null)
        {
            throw new InvalidOperationException("Error al recuperar los datos actualizados del usuario.");
        }

        return userDetail;
    }

    public async Task<UserDetailResponseDto> CambiarEstadoUsuarioPorAdminAsync(int id, bool isActive)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
        {
            throw new KeyNotFoundException($"No se encontró el usuario con ID {id}.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Contains("Administrador"))
        {
            throw new InvalidOperationException("No se permite modificar el estado de un usuario administrador.");
        }

        user.IsActive = isActive;

        // Si se desactiva el usuario, revocamos sus sesiones y tokens activos
        if (!isActive)
        {
            user.SecurityStamp = Guid.NewGuid().ToString();
        }

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var errors = string.Join("; ", updateResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Error al cambiar el estado del usuario: {errors}");
        }

        var userDetail = await ObtenerDetallePorIdAsync(id);
        if (userDetail == null)
        {
            throw new InvalidOperationException("Error al recuperar los datos del usuario actualizado.");
        }

        return userDetail;
    }

    public bool Actualizar(User user)
    {
        try
        {
            _context.Users.Update(user);
            int filasAfectadas = _context.SaveChanges();
            return filasAfectadas > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al actualizar usuario: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> ActualizarAsync(User user)
    {
        try
        {
            _context.Users.Update(user);
            int filasAfectadas = await _context.SaveChangesAsync();
            return filasAfectadas > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al actualizar usuario de forma asíncrona: {ex.Message}");
            return false;
        }
    }

    public bool Eliminar(User user)
    {
        try
        {
            _context.Users.Remove(user);
            int filasAfectadas = _context.SaveChanges();
            return filasAfectadas > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al eliminar usuario: {ex.Message}");
            return false;
        }
    }
}
