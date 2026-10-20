import api from "./api";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const userService = {
  /**
   * Obtener el detalle de un usuario por su ID (Rol Administrador).
   * @param {number|string} id - ID del usuario.
   * @returns {Promise<{id: number, firstName: string, lastName: string, email: string, documentType: string, documentNumber: string, role: string, isActive: boolean, createdAt: string, account: {id: number, cvu: string, alias: string, balance: number, currency: string, createdAt: string}|null}>}
   */
  async getUserById(id) {
    const response = await api.get(`/User/${id}`, {
      headers: authHeader(),
    });
    return response.data;
  },

  /**
   * Obtener lista paginada de usuarios (Rol Administrador).
   * @param {number} pagina - Número de página.
   * @param {number} porPagina - Cantidad por página.
   * @returns {Promise<{totalRegistros: number, paginaActual: number, porPagina: number, totalPaginas: number, usuarios: Array}>}
   */
  async getUsers(pagina = 1, porPagina = 10) {
    const response = await api.get(`/User?pagina=${pagina}&porPagina=${porPagina}`, {
      headers: authHeader(),
    });
    return response.data;
  },

  /**
   * Actualizar datos básicos de un usuario (Rol Administrador).
   * @param {number|string} id - ID del usuario.
   * @param {{firstName: string, lastName: string, email: string}} data - Datos a actualizar.
   * @returns {Promise<any>}
   */
  async updateUser(id, data) {
    const response = await api.put(`/User/${id}`, data, {
      headers: authHeader(),
    });
    return response.data;
  },

  /**
   * Activar o desactivar lógicamente a un usuario (Rol Administrador).
   * @param {number|string} id - ID del usuario.
   * @param {boolean} isActive - Nuevo estado del usuario.
   * @returns {Promise<any>}
   */
  async updateUserStatus(id, isActive) {
    const response = await api.patch(`/User/${id}/status`, { isActive }, {
      headers: authHeader(),
    });
    return response.data;
  },
};

export default userService;
