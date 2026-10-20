using System.ComponentModel.DataAnnotations;

namespace WalletApi.Options;

public class AdminUserOptions
{
    public const string SectionName = "AdminUser";

    [Required(ErrorMessage = "AdminUser:Email es obligatorio.")]
    [EmailAddress(ErrorMessage = "AdminUser:Email debe ser un correo válido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "AdminUser:Password es obligatoria.")]
    [MinLength(6, ErrorMessage = "AdminUser:Password debe tener al menos 6 caracteres.")]
    public string Password { get; set; } = string.Empty;
}
