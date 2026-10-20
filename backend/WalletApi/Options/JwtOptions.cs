using System.ComponentModel.DataAnnotations;

namespace WalletApi.Options;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required(ErrorMessage = "Jwt:Key es obligatoria.")]
    [MinLength(32, ErrorMessage = "La clave JWT debe tener al menos 32 caracteres.")]
    public string Key { get; set; } = string.Empty;

    [Required(ErrorMessage = "Jwt:Issuer es obligatorio.")]
    public string Issuer { get; set; } = string.Empty;

    [Required(ErrorMessage = "Jwt:Audience es obligatorio.")]
    public string Audience { get; set; } = string.Empty;

    [Range(1, 1440, ErrorMessage = "Jwt:ExpirationMinutes debe estar entre 1 y 1440 minutos.")]
    public int ExpirationMinutes { get; set; } = 60;
}
