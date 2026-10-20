import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../Contexts/AuthContext";

function getRoleFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload["role"] ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      null
    );
  } catch {
    return null;
  }
}

const AdminRoute = () => {
  const { userId, userToken, userRole } = useContext(AuthContext);

  if (!userId || !userToken) {
    return <Navigate to="/auth" replace />;
  }

  const role =
    userRole ||
    localStorage.getItem("userRole") ||
    getRoleFromToken(userToken);

  const isAdmin =
    role === "Administrador" ||
    (Array.isArray(role) && role.includes("Administrador"));

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
