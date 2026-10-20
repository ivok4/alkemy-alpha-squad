import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5016/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const msg = error.response.data?.message || "";
      if (msg.includes("inactivo") || msg.includes("desactivada")) {
        sessionStorage.setItem(
          "auth_notice",
          JSON.stringify({
            message: "Tu cuenta ha sido desactivada por un administrador. Comunícate con soporte.",
            type: "DEACTIVATED",
          })
        );
      }

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userData");

      if (window.location.pathname !== "/auth" && window.location.pathname !== "/") {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
