using System;
using System.Collections.Generic;

namespace WalletApi.Dtos;

public record UserProfileResponseDto(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string DocumentType,
    string DocumentNumber,
    DateTime CreatedAt,
    bool IsActive
);

