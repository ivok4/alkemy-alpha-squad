using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
namespace WalletApi.Data.Entities;


public class Transaction
{
    public int Id { get; set; }
    // Cuenta titular de este movimiento (a la que se le debita o acredita saldo)
    public int AccountId { get; set; }
    public virtual Account Account { get; set; } = null!;
    public decimal Amount { get; set; }
    
    // Tipo de movimiento fuertemente tipado
    public TransactionType Type { get; set; } 
    public string Description { get; set; } = string.Empty;
    // Contraparte: la otra cuenta involucrada en la transferencia
    public int? CounterpartAccountId { get; set; }
    public virtual Account? CounterpartAccount { get; set; }
    // Movimiento espejo (criterio: "referenciados entre sí")
    public int? RelatedTransactionId { get; set; }
    public virtual Transaction? RelatedTransaction { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
