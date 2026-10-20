using WalletApi.Data.Entities;
using WalletApi.Dtos;

namespace WalletApi.Interfaces;

public interface IUserService
{
    IReadOnlyList<User> ObtenerTodas();
    Task<PagedUsersResponseDto> ObtenerUsuariosPaginadosAsync(int pagina, int porPagina);
    User? ObtenerPorId(int id);
    User? ObtenerPorEmail(string email);
    Task<UserDetailResponseDto?> ObtenerDetallePorIdAsync(int id);
    Task<UserDetailResponseDto> CrearUsuarioPorAdminAsync(CreateUserAdminRequestDto request);
    Task<UserDetailResponseDto> ActualizarUsuarioPorAdminAsync(int id, UpdateUserAdminRequestDto request);
    Task<UserDetailResponseDto> CambiarEstadoUsuarioPorAdminAsync(int id, bool isActive);
    bool Actualizar(User user);
    Task<bool> ActualizarAsync(User user);
    bool Eliminar(User user);
}
