import api from "./api";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const notificationService = {
  /**
   * Obtiene la lista de notificaciones del usuario autenticado (ordenadas cronológicamente descendente).
   * @param {number} [page=1]
   * @param {number} [pageSize=50]
   * @returns {Promise<{total: number, unreadCount: number, notifications: Array<{id: number, userId: number, title: string, message: string, type: string, isRead: boolean, createdAt: string, referenceId: number|null}>}>}
   */
  async getNotifications(page = 1, pageSize = 50) {
    const response = await api.get("/notifications", {
      params: { page, pageSize },
      headers: authHeader(),
    });
    return response.data;
  },

  /**
   * Obtiene la cantidad de notificaciones no leídas del usuario.
   * @returns {Promise<{unreadCount: number}>}
   */
  async getUnreadCount() {
    const response = await api.get("/notifications/unread-count", {
      headers: authHeader(),
    });
    return response.data;
  },

  /**
   * Marca una notificación específica como leída.
   * @param {number} id
   * @returns {Promise<{message: string, id: number}>}
   */
  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`, {}, {
      headers: authHeader(),
    });
    return response.data;
  },

  /**
   * Marca todas las notificaciones del usuario como leídas.
   * @returns {Promise<{message: string, updatedCount: number}>}
   */
  async markAllAsRead() {
    const response = await api.patch("/notifications/read-all", {}, {
      headers: authHeader(),
    });
    return response.data;
  },

  /**
   * Elimina una notificación específica.
   * @param {number} id
   * @returns {Promise<{message: string, id: number}>}
   */
  async deleteNotification(id) {
    const response = await api.delete(`/notifications/${id}`, {
      headers: authHeader(),
    });
    return response.data;
  },

  /**
   * Elimina todas las notificaciones del usuario autenticado.
   * @returns {Promise<{message: string, deletedCount: number}>}
   */
  async clearAllNotifications() {
    const response = await api.delete("/notifications", {
      headers: authHeader(),
    });
    return response.data;
  },
};

export default notificationService;
