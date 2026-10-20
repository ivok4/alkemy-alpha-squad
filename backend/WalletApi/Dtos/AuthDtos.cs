using System.ComponentModel.DataAnnotations;

namespace WalletApi.Dtos;

public class RegisterUserRequestDto
{
    [Required(ErrorMessage = "First name is required.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "First name must be between 2 and 50 characters.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Last name is required.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Last name must be between 2 and 50 characters.")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Document type is required.")]
    [Range(1, int.MaxValue, ErrorMessage = "Invalid document type.")]
    public int DocumentTypeId { get; set; }

    [Required(ErrorMessage = "Document number is required.")]
    [StringLength(30, MinimumLength = 4, ErrorMessage = "Document number must be between 4 and 30 characters.")]
    public string DocumentNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email format.")]
    [StringLength(250, ErrorMessage = "Email cannot exceed 250 characters.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters long.")]
    public string Password { get; set; } = string.Empty;
}

public class RegisterUserResponseDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int DocumentTypeId { get; set; }
    public string DocumentTypeCode { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public AccountResponseDto Account { get; set; } = null!;
}

public class DocumentTypeDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class FirstLoginVerifyRequestDto
{
    [Required(ErrorMessage = "El correo electrónico es obligatorio.")]
    [EmailAddress(ErrorMessage = "Formato de correo electrónico inválido.")]
    public string Email { get; set; } = string.Empty;
}

public class FirstLoginVerifyResponseDto
{
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}

public class FirstLoginSetPasswordRequestDto
{
    [Required(ErrorMessage = "El correo electrónico es obligatorio.")]
    [EmailAddress(ErrorMessage = "Formato de correo electrónico inválido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "La confirmación de contraseña es obligatoria.")]
    [Compare(nameof(Password), ErrorMessage = "Las contraseñas no coinciden.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
