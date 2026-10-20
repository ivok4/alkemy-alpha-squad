import { useState } from "react";
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
  Stack,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  KeyOutlined,
  CheckCircle,
  ArrowBack,
  LockReset,
} from "@mui/icons-material";
import api from "../services/api";

function FirstLoginForm({ onToggleLogin }) {
  const [step, setStep] = useState(1); // 1: Verify Email, 2: Set Password, 3: Success
  const [email, setEmail] = useState("");
  const [userInfo, setUserInfo] = useState({ firstName: "", lastName: "" });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorConfig, setErrorConfig] = useState({ message: "", type: "" });
  const [successMessage, setSuccessMessage] = useState("");

  // Step 1: Verify eligibility
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorConfig({
        message: "Por favor, ingresa tu correo electrónico.",
        type: "VALIDATION",
      });
      return;
    }

    setLoading(true);
    setErrorConfig({ message: "", type: "" });

    try {
      const response = await api.post("/auth/first-login/verify", {
        email: email.trim(),
      });

      const data = response.data;
      setUserInfo({
        firstName: data.firstName || "Usuario",
        lastName: data.lastName || "",
      });
      setStep(2);
    } catch (error) {
      console.error("Error al verificar primer ingreso:", error);
      const statusCode = error.response?.status;
      const backendMsg = error.response?.data?.message;

      if (!error.response) {
        setErrorConfig({
          message: "No pudimos conectar con el servidor. Inténtalo más tarde.",
          type: "NETWORK_ERROR",
        });
      } else if (statusCode === 400 || statusCode === 404) {
        setErrorConfig({
          message:
            backendMsg ||
            "El correo ingresado no requiere configuración de contraseña o no existe.",
          type: "WARNING",
        });
      } else {
        setErrorConfig({
          message: "Ocurrió un error inesperado al verificar el correo.",
          type: "UNKNOWN",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set new password
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setErrorConfig({ message: "", type: "" });

    if (!password || !confirmPassword) {
      setErrorConfig({
        message: "Por favor, completa todos los campos.",
        type: "VALIDATION",
      });
      return;
    }

    if (password.length < 8) {
      setErrorConfig({
        message: "La contraseña debe tener al menos 8 caracteres.",
        type: "VALIDATION",
      });
      return;
    }

    if (password !== confirmPassword) {
      setErrorConfig({
        message: "Las contraseñas no coinciden.",
        type: "VALIDATION",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/first-login/set-password", {
        email: email.trim(),
        password: password,
        confirmPassword: confirmPassword,
      });

      setSuccessMessage(
        response.data?.message ||
          "¡Contraseña establecida con éxito! Ya puedes iniciar sesión con tu nueva contraseña."
      );
      setStep(3);
    } catch (error) {
      console.error("Error al establecer contraseña:", error);
      let backendMsg = error.response?.data?.message;
      if (!backendMsg && error.response?.data?.errors) {
        backendMsg = Object.values(error.response.data.errors).flat().join(" ");
      }
      setErrorConfig({
        message:
          backendMsg ||
          "No se pudo guardar la contraseña. Por favor, inténtalo nuevamente.",
        type: "ERROR",
      });
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
          {step === 3 ? (
            <CheckCircle sx={{ fontSize: 28, color: "#10b981" }} />
          ) : (
            <KeyOutlined sx={{ fontSize: 28, color: "#38bdf8" }} />
          )}
        </Box>
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, color: "#f3f4f6" }}
        >
          {step === 1 && "Primer Ingreso"}
          {step === 2 && "Crea tu Contraseña"}
          {step === 3 && "¡Cuenta Activada!"}
        </Typography>
        <Typography variant="body2" sx={{ color: "#9ca3af", mt: 0.5 }}>
          {step === 1 &&
            "Si tu cuenta fue dada de alta por un administrador, ingresa tu correo para comenzar."}
          {step === 2 &&
            `Hola ${userInfo.firstName}, establece una contraseña segura para tu cuenta.`}
          {step === 3 &&
            "Tu contraseña ha sido configurada correctamente. Ya puedes acceder a DigitalArs."}
        </Typography>
      </Box>

      {/* Alerts */}
      {errorConfig.message && (
        <Alert
          severity={errorConfig.type === "WARNING" ? "warning" : "error"}
          sx={{ mb: 3 }}
        >
          {errorConfig.type === "NETWORK_ERROR" && (
            <AlertTitle>Fallo de conexión</AlertTitle>
          )}
          {errorConfig.message}
        </Alert>
      )}

      {/* STEP 1: Verify Email */}
      {step === 1 && (
        <Box component="form" onSubmit={handleVerifyEmail} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="first-login-email"
            label="Correo Electrónico"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="ejemplo@correo.com"
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
              "Continuar"
            )}
          </Button>

          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.06)" }} />

          <Box sx={{ textAlign: "center", mt: 1 }}>
            <Button
              variant="text"
              startIcon={<ArrowBack />}
              onClick={onToggleLogin}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                color: "#9ca3af",
                "&:hover": { color: "#f3f4f6" },
              }}
            >
              Volver a Iniciar Sesión
            </Button>
          </Box>
        </Box>
      )}

      {/* STEP 2: Set Password */}
      {step === 2 && (
        <Box component="form" onSubmit={handleSetPassword} noValidate>
          <Box
            sx={{
              bgcolor: "rgba(56, 189, 248, 0.08)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: 2,
              p: 1.5,
              mb: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              Estableciendo contraseña para:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#38bdf8" }}>
              {email}
            </Typography>
          </Box>

          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="Nueva Contraseña"
            type={showPassword ? "text" : "password"}
            id="newPassword"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            helperText="Mínimo 8 caracteres"
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

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirmar Contraseña"
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="alternar visibilidad de confirmación"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                      size="small"
                      sx={{ color: "#9ca3af" }}
                    >
                      {showConfirmPassword ? (
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
            startIcon={<LockReset />}
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
              "Establecer Contraseña"
            )}
          </Button>

          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.06)" }} />

          <Stack direction="row" justifyContent="space-between">
            <Button
              variant="text"
              startIcon={<ArrowBack />}
              onClick={() => {
                setStep(1);
                setPassword("");
                setConfirmPassword("");
                setErrorConfig({ message: "", type: "" });
              }}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                color: "#9ca3af",
                "&:hover": { color: "#f3f4f6" },
              }}
            >
              Cambiar correo
            </Button>
            <Button
              variant="text"
              onClick={onToggleLogin}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                color: "#9ca3af",
                "&:hover": { color: "#f3f4f6" },
              }}
            >
              Cancelar
            </Button>
          </Stack>
        </Box>
      )}

      {/* STEP 3: Success Screen */}
      {step === 3 && (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Alert severity="success" sx={{ mb: 3, textAlign: "left" }}>
            {successMessage}
          </Alert>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={onToggleLogin}
            sx={{
              py: 1.3,
              fontWeight: 700,
              fontSize: "1rem",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              },
            }}
          >
            Iniciar Sesión Ahora
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default FirstLoginForm;
