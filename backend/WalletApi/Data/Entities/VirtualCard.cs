
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WalletApi.Data.Entities // Asegúrate de que coincida con tu namespace
{
    public class VirtualCard
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(16)]
        public string CardNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(5)] // Formato MM/yy
        public string ExpirationDate { get; set; } = string.Empty;

        [Required]
        [MaxLength(3)] // Código de seguridad de 3 dígitos
        public string Cvv { get; set; } = string.Empty;

        public bool IsFrozen { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relación con el usuario (Clave Foránea)
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}