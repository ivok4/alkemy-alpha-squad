import { useState, useContext, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  Alert,
  AlertTitle,
  Button,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, LoginOutlined } from "@mui/icons-material";
import api from "../services/api";
import AuthContext from "../Contexts/AuthContext";

function LoginForm({ onToggleRegister, onToggleFirstLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorConfig, setErrorConfig] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const { setUserId, setUserToken, setUserData,setUserRole } = useContext(AuthContext);

  useEffect(() => {
    const savedNotice = sessionStorage.getItem("auth_notice");
    if (savedNotice) {
      sessionStorage.removeItem("auth_notice");
      try {
        const parsed = JSON.parse(savedNotice);
        setErrorConfig({ message: parsed.message, type: parsed.type });
      } catch {
        setErrorConfig({ message: savedNotice, type: "DEACTIVATED" });
      }
    }
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorConfig({ message: "", type: "" });

    try {
      const response = await api.post("/auth/login", {
        email: email,
        password: password,
      });

      const data = response.data;
      const role = (data?.roles && data.roles.length > 0) ? data.roles[0] : (data?.role || "Usuario");

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      if (data?.userId) {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("token", data.token);
        setUserData({
          firstName:data.firstName,
          lastName:data.lastName
        })
      }
      localStorage.setItem("userRole", role);

      console.log("Login exitoso:", data.message);
      setUserId(data.userId);
      setUserToken(data.token);
      if (setUserRole) setUserRole(role);
       setUserData({
          firstName:data.firstName,
          lastName:data.lastName
        })


      //navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Detalle completo del error:", error);

      if (!error.response) {
        setErrorConfig({
          message:
            "No pudimos conectar con el servidor. Puedes probar con las credenciales o el acceso demo.",
          type: "NETWORK_ERROR",
        });
      } else {
        const statusCode = error.response.status;
        const mensajeBackend = error.response.data?.message || "";

        if (statusCode === 401) {
          if (mensajeBackend.includes("desactivada")) {
            setErrorConfig({
              message: mensajeBackend,
              type: "DEACTIVATED",
            });
          } else {
            setErrorConfig({
              message:
                mensajeBackend ||
                "Credenciales inválidas. Verifica tu correo y contraseña.",
              type: "INVALID_CREDENTIALS",
            });
          }
        } else if (statusCode === 400) {
          setErrorConfig({
            message: "Faltan datos o el formato del correo es incorrecto.",
            type: "BAD_REQUEST",
          });
        } else {
          setErrorConfig({
            message: "Ocurrió un error inesperado. Inténtalo nuevamente.",
            type: "UNKNOWN",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Box
          sx={{
            display: "inline-flex",
            p: 1.5,
            borderRadius: "14px",
            bgcolor: "rgba(56, 189, 248, 0.12)",
            mb: 1.5,
          }}
        >
          <LoginOutlined sx={{ fontSize: 28, color: "#38bdf8" }} />
        </Box>
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, color: "#f3f4f6" }}
        >
          Iniciar Sesión
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#9ca3af", mt: 0.5 }}
        >
          Accede a tu billetera virtual DigitalArs
        </Typography>
      </Box>

      {errorConfig.message && (
        <Alert
          severity={
            errorConfig.type === "INVALID_CREDENTIALS" ? "warning" : "error"
          }
          sx={{ mb: 3 }}
          action={
            errorConfig.type === "DEACTIVATED" ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => alert("Abriendo chat de soporte...")}
              >
                SOPORTE
              </Button>
            ) : null
          }
        >
          {errorConfig.type === "NETWORK_ERROR" && (
            <AlertTitle>Fallo de conexión</AlertTitle>
          )}
          {errorConfig.type === "DEACTIVATED" && (
            <AlertTitle>Acceso denegado</AlertTitle>
          )}
          {errorConfig.message}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Correo Electrónico"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="alternar visibilidad de contraseña"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                    sx={{ color: "#9ca3af" }}
                  >
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.3,
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Ingresar"
          )}
        </Button>
        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.06)" }} />
        <Box sx={{ textAlign: "center", mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" sx={{ color: "#9ca3af" }}>
            ¿Aún no tienes una cuenta?{" "}
            <Button
              variant="text"
              color="primary"
              onClick={onToggleRegister}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                p: 0,
                minWidth: 0,
              }}
            >
              Regístrate aquí
            </Button>
          </Typography>

          {onToggleFirstLogin && (
            <Typography variant="body2" sx={{ color: "#9ca3af" }}>
              ¿Fuiste dado de alta por un administrador?{" "}
              <Button
                variant="text"
                color="secondary"
                onClick={onToggleFirstLogin}
                sx={{
                  fontWeight: 700,
                  textTransform: "none",
                  p: 0,
                  minWidth: 0,
                  color: "#38bdf8",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Primer ingreso
              </Button>
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default LoginForm;
