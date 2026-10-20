import api from "./api";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const virtualCardService = {
  async getMyCard() {
    const response = await api.get("/card/me", { headers: authHeader() });
    return response.data;
  },
  async createCard() {
    const response = await api.post("/card/create", { headers: authHeader() });
    return response.data;
  },
  async toggleFreezeCard() {
    const response = await api.put("/Card/toggle-freeze", {
      headers: authHeader(),
    });
    return response.data;
  },
};
