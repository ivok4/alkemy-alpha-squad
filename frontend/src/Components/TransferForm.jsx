import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
  InputAdornment,
  Paper,
} from "@mui/material";
import { Send, CheckCircle, Person } from "@mui/icons-material";
import accountService from "../services/accountService";

function TransferForm({ onTransferSuccess, availableBalance }) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const [lookupError, setLookupError] = useState("");

  const validateDestinationFormat = (val) => {
    const trimmed = (val || "").trim();
    if (!trimmed) return "El destino es obligatorio.";
    const isCvu = /^\d{22}$/.test(trimmed);
    const isAlias = trimmed.length >= 3;
    if (!isCvu && !isAlias) {
      return "Ingrese un CVU válido (22 dígitos) o un Alias válido.";
    }
    return null;
  };

  const handleLookup = async (destToLookup) => {
    const target = destToLookup || destination;
    const formatErr = validateDestinationFormat(target);
    if (formatErr) {
      setLookupError(formatErr);
      setRecipient(null);
      return;
    }

    setLookingUp(true);
    setLookupError("");
    setRecipient(null);

    try {
      const data = await accountService.lookupRecipient(target.trim());
      setRecipient(data);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "No se pudo encontrar el destinatario. Verifique el Alias o CVU ingresado.";
      setLookupError(msg);
      setRecipient(null);
    } finally {
      setLookingUp(false);
    }
  };

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
    const parts = value.toString().split(".");
    if (parts.length === 2 && parts[1].length > 2) {
      return "El importe no puede tener más de 2 decimales.";
    }
    if (availableBalance !== undefined && num > availableBalance) {
      return `Saldo insuficiente. Tu saldo disponible es $${availableBalance.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}.`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError("");

    const destError = validateDestinationFormat(destination);
    if (destError) {
      setError(destError);
      return;
    }

    const amountError = validateAmount(amount);
    if (amountError) {
      setError(amountError);
      return;
    }

    setLoading(true);
    try {
      const result = await accountService.transfer(
        destination.trim(),
        parseFloat(amount)
      );

      setSuccess(result);
      setDestination("");
      setAmount("");
      setRecipient(null);
      setLookupError("");

      if (onTransferSuccess) {
        onTransferSuccess(result.newBalance);
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const msg = err.response.data?.message;

        if (status === 401) {
          setError("Sesión expirada o usuario inactivo. Vuelva a iniciar sesión.");
        } else if (status === 404) {
          setError(msg || "La cuenta de destino no fue encontrada.");
        } else if (status === 400) {
          setError(msg || "Datos de transferencia inválidos.");
        } else {
          setError(msg || "Ocurrió un error inesperado al procesar la transferencia.");
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
          <Send sx={{ fontSize: 22, color: "#38bdf8" }} />
        </Box>
        <Box>
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{ fontWeight: 700, color: "#f3f4f6" }}
          >
            Transferir Dinero
          </Typography>
          <Typography variant="caption" sx={{ color: "#9ca3af" }}>
            Envía dinero ingresando Alias o CVU
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
            <Typography variant="subtitle2" fontWeight="bold">
              {success.message}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Transferiste{" "}
              <strong>
                $
                {success.amount.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>{" "}
              a <strong>{success.recipientName}</strong>.
            </Typography>
            <Typography
              variant="caption"
              display="block"
              sx={{ mt: 0.5, opacity: 0.85 }}
            >
              Nuevo saldo: $
              {success.newBalance.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Input único de Destino */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="transfer-destination"
            label="Alias o CVU de destino"
            name="destination"
            placeholder="Ej: mialias.mp o 22 dígitos"
            value={destination}
            disabled={loading}
            onChange={(e) => {
              setDestination(e.target.value);
              setRecipient(null);
              setLookupError("");
            }}
            onBlur={() => {
              if (destination.trim()) {
                handleLookup(destination);
              }
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {lookingUp ? (
                      <CircularProgress size={20} sx={{ color: "#38bdf8" }} />
                    ) : recipient ? (
                      <CheckCircle sx={{ color: "#10b981" }} />
                    ) : null}
                  </InputAdornment>
                ),
              },
            }}
            helperText="Ingresá el Alias o CVU (22 números)"
            error={Boolean(lookupError)}
          />

          {/* Feedback de búsqueda de destinatario */}
          {lookupError && (
            <Alert
              severity="warning"
              sx={{ mt: 1, mb: 1 }}
              onClose={() => setLookupError("")}
            >
              {lookupError}
            </Alert>
          )}

          {recipient && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 1.5,
                borderRadius: 2,
                bgcolor: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Person sx={{ color: "#10b981" }} />
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "#10b981" }}
                >
                  {recipient.recipientName}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ color: "#9ca3af" }}
                >
                  Alias: {recipient.alias} | CVU: {recipient.cvu}
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Input de Importe */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="transfer-amount"
            label="Importe a transferir"
            name="amount"
            type="number"
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
            helperText={
              availableBalance !== undefined
                ? `Disponible: $${availableBalance.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "Monto mayor a $0 con hasta 2 decimales"
            }
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || lookingUp}
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
              "Confirmar y Transferir"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default TransferForm;
