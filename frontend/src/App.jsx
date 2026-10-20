import { useState, useContext,useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet
} from "react-router-dom";
import AuthComponent from "./Containers/Auth";
import Dashboard from "./Containers/Dashboard";
import TransactionHistory from "./Containers/TransactionHistory";
import UsersList from "./Containers/UsersList";
import RootLayout from "./Containers/RootLayout";
import LandingPage from "./Containers/LandingPage";
import AdminRoute from "./Components/AdminRoute";
import AuthContext from "./Contexts/AuthContext";
import Profile from "./Containers/Profile";


const ProtectedRoute = () => {
  const { userId, userToken } = useContext(AuthContext);
  return (userId && userToken) ? <Outlet /> : <Navigate to="/auth" replace />;
};

const PublicRoute = () => {
  const { userId, userToken } = useContext(AuthContext);
  return (!userId || !userToken) ? <AuthComponent /> : <Navigate to="/dashboard" replace />;
};

// Landing page: show welcome if not logged in, redirect to dashboard if logged in
const LandingRoute = () => {
  const { userId, userToken } = useContext(AuthContext);
  return (!userId || !userToken) ? <LandingPage /> : <Navigate to="/dashboard" replace />;
};

const router = createBrowserRouter([
  {
    // Landing page — public welcome screen
    path: "/",
    element: <LandingRoute />,
  },
  {
    // Authenticated app routes
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "transactionHistory", element: <TransactionHistory /> },
          {
            element: <AdminRoute />,
            children: [
              { path: "users", element: <UsersList /> },
            ],
          },
          { path: "profile", element: <Profile /> },
        ],
      },
    ],
  },
  {
    path: "/auth",
    element: <PublicRoute />, // Si ya está logueado, lo saca de auth
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem("userId") || null;
  });
  const [userToken, setUserToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("userRole") || null;
  });
const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("userData");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
    } else {
      localStorage.removeItem("userData");
    }
  }, [userData]);

  const logout = () => {
    setUserId(null);
    setUserToken(null);
    setUserData(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    // El useEffect de arriba se encargará de remover "userData"
  };

  const value = {
    userId,
    setUserId,
    userToken,
    setUserToken,
    userRole,
    setUserRole,
    userData,
    setUserData,
    logout
  };
  return (
    <AuthContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

export default App;
