import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
  InputAdornment,
} from "@mui/material";
import { ArrowDownward } from "@mui/icons-material";
import accountService from "../services/accountService";

function DepositForm({ onDepositSuccess }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const validateAmount = (value) => {
    if (value === "" || value === null || value === undefined) {
      return "El importe es obligatorio.";
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
      return "Ingrese un número válido.";
    }
    if (num <= 0) {
      return "El importe debe ser mayor a cero.";
    }
    // Check max 2 decimals
    const parts = value.toString().split(".");
    if (parts.length === 2 && parts[1].length > 2) {
      return "El importe no puede tener más de 2 decimales.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError("");

    const validationError = validateAmount(amount);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await accountService.deposit(parseFloat(amount));
      setSuccess(result);
      setAmount("");
      if (onDepositSuccess) {
        onDepositSuccess(result.newBalance);
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const msg = err.response.data?.message;

        if (status === 401) {
          setError("Sesión expirada o usuario inactivo. Vuelva a iniciar sesión.");
        } else if (status === 400) {
          setError(msg || "Importe inválido. Verifique el monto ingresado.");
        } else {
          setError(msg || "Ocurrió un error inesperado. Intente nuevamente.");
        }
      } else {
        setError("No se pudo conectar con el servidor. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "rgba(13, 17, 24, 0.94)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        backdropFilter: "blur(20px)",
        overflow: "hidden",
        animation: "fadeInUp 0.4s ease both",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(14, 165, 233, 0.08) 100%)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          p: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            p: 1,
            borderRadius: "12px",
            bgcolor: "rgba(56, 189, 248, 0.18)",
          }}
        >
          <ArrowDownward sx={{ fontSize: 22, color: "#38bdf8" }} />
        </Box>
        <Box>
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{ fontWeight: 700, color: "#f3f4f6" }}
          >
            Ingresar Dinero
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#9ca3af" }}
          >
            Depósito simulado a tu cuenta
          </Typography>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccess(null)}
          >
            {success.message} — Nuevo saldo:{" "}
            <strong>
              $
              {success.newBalance.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="deposit-amount"
            label="Importe a depositar"
            name="amount"
            type="number"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography sx={{ color: "#38bdf8", fontWeight: 600 }}>
                      $
                    </Typography>
                  </InputAdornment>
                ),
              },
              htmlInput: {
                min: "0.01",
                step: "0.01",
              },
            }}
            helperText="Ingrese un monto mayor a $0 con hasta 2 decimales"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.3,
              fontWeight: 700,
              fontSize: "1rem",
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Depositar"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default DepositForm;
