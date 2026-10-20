using System;
using System.Collections.Generic;

namespace WalletApi.Dtos;

public class UserListItemDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Role { get; set; } = "Usuario";
}

public class PagedUsersResponseDto
{
    public int TotalRegistros { get; set; }
    public int PaginaActual { get; set; }
    public int PorPagina { get; set; }
    public int TotalPaginas { get; set; }
    public IReadOnlyList<UserListItemDto> Usuarios { get; set; } = new List<UserListItemDto>();
}

public class UserDetailResponseDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string Estado => IsActive ? "Activo" : "Inactivo";

    public DateTime CreatedAt { get; set; }
    public string Role { get; set; } = "Usuario";
    public AccountResponseDto? Account { get; set; }
}

public class CreateUserAdminRequestDto
{
    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "El nombre es obligatorio.")]
    [System.ComponentModel.DataAnnotations.StringLength(50, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 50 caracteres.")]
    public string FirstName { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "El apellido es obligatorio.")]
    [System.ComponentModel.DataAnnotations.StringLength(50, MinimumLength = 2, ErrorMessage = "El apellido debe tener entre 2 y 50 caracteres.")]
    public string LastName { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "El tipo de documento es obligatorio.")]
    [System.ComponentModel.DataAnnotations.Range(1, int.MaxValue, ErrorMessage = "Tipo de documento inválido.")]
    public int DocumentTypeId { get; set; }

    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "El número de documento es obligatorio.")]
    [System.ComponentModel.DataAnnotations.StringLength(30, MinimumLength = 4, ErrorMessage = "El número de documento debe tener entre 4 y 30 caracteres.")]
    public string DocumentNumber { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "El correo electrónico es obligatorio.")]
    [System.ComponentModel.DataAnnotations.EmailAddress(ErrorMessage = "Formato de correo electrónico inválido.")]
    [System.ComponentModel.DataAnnotations.StringLength(250, ErrorMessage = "El correo no puede exceder 250 caracteres.")]
    public string Email { get; set; } = string.Empty;
}

public class UpdateUserAdminRequestDto
{
    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "El nombre es obligatorio.")]
    [System.ComponentModel.DataAnnotations.StringLength(50, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 50 caracteres.")]
    public string FirstName { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "El apellido es obligatorio.")]
    [System.ComponentModel.DataAnnotations.StringLength(50, MinimumLength = 2, ErrorMessage = "El apellido debe tener entre 2 y 50 caracteres.")]
    public string LastName { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "El correo electrónico es obligatorio.")]
    [System.ComponentModel.DataAnnotations.EmailAddress(ErrorMessage = "Formato de correo electrónico inválido.")]
    [System.ComponentModel.DataAnnotations.StringLength(250, ErrorMessage = "El correo no puede exceder 250 caracteres.")]
    public string Email { get; set; } = string.Empty;
}

public class UpdateUserStatusRequestDto
{
    public bool IsActive { get; set; }
}

