using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WalletApi.Dtos;
using WalletApi.Models;
using WalletApi.Data.Entities;
using WalletApi.Interfaces;
namespace WalletApi.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<int>> _roleManager;
    private readonly WalletContext _context;
    private readonly IAliasGeneratorService _aliasGenerator;
    private readonly ICvuGeneratorService _cvuGenerator;
    private readonly ITokenService _tokenService;

    private const string DefaultRole = "Usuario";

    public AuthService(
        UserManager<User> userManager,
        RoleManager<IdentityRole<int>> roleManager,
        WalletContext context,
        IAliasGeneratorService aliasGenerator,
        ICvuGeneratorService cvuGenerator,
        ITokenService tokenService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _aliasGenerator = aliasGenerator;
        _cvuGenerator = cvuGenerator;
        _tokenService = tokenService;
    }
    //Agregado de mas-------------------------------------------------------------
    public async Task RevokeSessionsAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            throw new ArgumentException("Usuario no encontrado.");
        }

        // Aquí sí existe _userManager:
        await _userManager.UpdateSecurityStampAsync(user);
    }

    public async Task<FirstLoginVerifyResponseDto> VerifyFirstLoginEligibilityAsync(FirstLoginVerifyRequestDto request)
    {
        var email = request.Email.Trim();
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null || !user.IsActive || !user.DebeCambiarPassword)
        {
            throw new InvalidOperationException("El correo ingresado no tiene un primer ingreso pendiente o no existe.");
        }

        return new FirstLoginVerifyResponseDto
        {
            Email = user.Email ?? email,
            FirstName = user.FirstName,
            LastName = user.LastName
        };
    }

    public async Task<bool> SetFirstLoginPasswordAsync(FirstLoginSetPasswordRequestDto request)
    {
        var email = request.Email.Trim();
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null || !user.IsActive || !user.DebeCambiarPassword)
        {
            throw new InvalidOperationException("El correo ingresado no tiene un primer ingreso pendiente o no existe.");
        }

        // Set password hasheada
        user.PasswordHash = _userManager.PasswordHasher.HashPassword(user, request.Password);
        user.DebeCambiarPassword = false;
        user.EmailConfirmed = true;
        user.SecurityStamp = Guid.NewGuid().ToString();

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var errors = string.Join("; ", updateResult.Errors.Select(e => e.Description));
            throw new ArgumentException($"Error al establecer la contraseña: {errors}");
        }

        return true;
    }
    //Agregado de mas-------------------------------------------------------------
    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email.Trim());

        if (user == null)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Esta cuenta ha sido desactivada. Contacte a soporte.");
        }

        var passwordIsValid = await _userManager.CheckPasswordAsync(user, request.Password);

        if (!passwordIsValid)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas.");
        }

        var roles = await _userManager.GetRolesAsync(user);

        var token = _tokenService.CrearToken(user, roles);

        return new LoginResponse
        {
            UserId = user.Id.ToString(),
            Email = user.Email ?? "",
            FirstName = user.FirstName,
            LastName = user.LastName,
            Message = "Login exitoso",
            Token = token,
            expiresAt = DateTime.UtcNow.AddMinutes(60).ToString("o"),
            Roles = roles.ToList()
        };
    }

    public async Task<IReadOnlyList<DocumentTypeDto>> GetDocumentTypesAsync()
    {
        return await _context.DocumentTypes
            .AsNoTracking()
            .Select(d => new DocumentTypeDto
            {
                Id = d.Id,
                Code = d.Code,
                Name = d.Name
            })
            .ToListAsync();
    }

    public async Task<RegisterUserResponseDto> RegisterAsync(RegisterUserRequestDto request)
    {
        // 1. Validate Document Type exists
        var documentType = await _context.DocumentTypes
            .FirstOrDefaultAsync(d => d.Id == request.DocumentTypeId);

        if (documentType == null)
        {
            throw new ArgumentException("The specified document type does not exist.");
        }

        // 2. Validate Document Number format based on type
        var normalizedDocNumber = request.DocumentNumber.Trim().ToUpperInvariant();
        ValidateDocumentNumber(documentType.Code, normalizedDocNumber);

        // 3. Check for Duplicate Email
        var existingUserByEmail = await _userManager.FindByEmailAsync(request.Email.Trim());
        if (existingUserByEmail != null)
        {
            throw new InvalidOperationException("The email is already in use.");
        }

        // 4. Check for Duplicate Document (DocumentTypeId + DocumentNumber)
        var existingUserByDoc = await _context.Users
            .AnyAsync(u => u.DocumentTypeId == request.DocumentTypeId && u.DocumentNumber == normalizedDocNumber);

        if (existingUserByDoc)
        {
            throw new InvalidOperationException("A user with this document type and number already exists.");
        }

        // 5. Ensure "Usuario" role exists
        if (!await _roleManager.RoleExistsAsync(DefaultRole))
        {
            await _roleManager.CreateAsync(new IdentityRole<int>
            {
                Name = DefaultRole,
                NormalizedName = DefaultRole.ToUpperInvariant()
            });
        }

        // 6. Execute registration and account creation inside a transaction
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var user = new User
            {
                UserName = request.Email.Trim(),
                Email = request.Email.Trim(),
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                DocumentTypeId = request.DocumentTypeId,
                DocumentNumber = normalizedDocNumber,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(user, request.Password);
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                throw new ArgumentException($"User registration failed: {errors}");
            }

            // Assign Default Role
            var roleResult = await _userManager.AddToRoleAsync(user, DefaultRole);
            if (!roleResult.Succeeded)
            {
                var errors = string.Join("; ", roleResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Role assignment failed: {errors}");
            }

            // Generate unique Alias and CVU
            var alias = await _aliasGenerator.GenerateUniqueAliasAsync();
            var cvu = await _cvuGenerator.GenerateUniqueCvuAsync();

            // Create initial ARS Account with $0 balance
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

            return new RegisterUserResponseDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email!,
                DocumentTypeId = user.DocumentTypeId,
                DocumentTypeCode = documentType.Code,
                DocumentNumber = user.DocumentNumber,
                Role = DefaultRole,
                Account = new AccountResponseDto
                {
                    Id = account.Id,
                    Balance = account.Balance,
                    Currency = account.Currency,
                    Alias = account.Alias,
                    Cvu = account.Cvu,
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
                    throw new ArgumentException("DNI must be numeric and between 7 and 8 digits.");
                }
                break;

            case "PAS":
                // Standard Argentine passport is 3 letters + 6 digits (e.g. ABC123456) or alphanumeric 6-12 chars
                if (!Regex.IsMatch(docNumber, @"^(?:[A-Z]{3}\d{6}|[A-Z0-9]{6,12})$"))
                {
                    throw new ArgumentException("Passport must follow standard format (e.g. 3 letters followed by 6 numbers).");
                }
                break;

            default:
                if (string.IsNullOrWhiteSpace(docNumber) || docNumber.Length < 4 || docNumber.Length > 30)
                {
                    throw new ArgumentException("Invalid document number length.");
                }
                break;
        }
    }
}
