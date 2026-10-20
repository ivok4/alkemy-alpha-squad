import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Divider,
} from "@mui/material";
import {
  CheckCircle,
  ContentCopy,
  Check,
  AccountBalanceWallet,
} from "@mui/icons-material";

export default function RegistrationSuccessModal({
  open,
  onClose,
  registrationData,
}) {
  const [copiedField, setCopiedField] = useState(null);

  if (!registrationData) return null;

  const {
    firstName,
    lastName,
    email,
    documentTypeCode,
    documentNumber,
    account,
    role,
  } = registrationData;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: { xs: 1, sm: 1.5 },
          bgcolor: "rgba(13, 17, 24, 0.96)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          boxShadow:
            "0 24px 64px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.15)",
          color: "#f3f4f6",
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pt: 3, pb: 1 }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: "50%",
            bgcolor: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            color: "#10b981",
            boxShadow: "0 0 24px rgba(16, 185, 129, 0.25)",
            mb: 2,
          }}
        >
          <CheckCircle sx={{ fontSize: 44 }} />
        </Box>

        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.02em",
            background:
              "linear-gradient(135deg, #7dd3fc 0%, #38bdf8 50%, #0ea5e9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          ¡Cuenta creada con éxito!
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: "rgba(255, 255, 255, 0.65)", mt: 0.8 }}
        >
          Bienvenido/a,{" "}
          <strong style={{ color: "#f3f4f6" }}>
            {firstName} {lastName}
          </strong>
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        {/* User Role and Document info */}
        <Box sx={{ mb: 2.5, textAlign: "center" }}>
          <Chip
            icon={
              <AccountBalanceWallet
                sx={{ fontSize: 18, color: "#38bdf8 !important" }}
              />
            }
            label={`Rol: ${role || "Usuario"} · Doc: ${documentTypeCode} ${documentNumber}`}
            size="small"
            sx={{
              bgcolor: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              color: "#7dd3fc",
              fontWeight: 600,
              fontSize: "0.78rem",
              py: 0.5,
              px: 1,
            }}
          />
        </Box>

        {/* Account Details Box */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            bgcolor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Initial Balance */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: "#9ca3af", fontWeight: 500 }}
            >
              Saldo inicial en cuenta
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#10b981" }}>
              $
              {account?.balance?.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
              }) || "0,00"}{" "}
              {account?.currency || "ARS"}
            </Typography>
          </Box>

          <Divider sx={{ my: 1.5, borderColor: "rgba(255, 255, 255, 0.08)" }} />

          {/* Alias */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: "#9ca3af",
                display: "block",
                fontWeight: 700,
                fontSize: "0.68rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                mb: 0.8,
              }}
            >
              ALIAS DE LA CUENTA
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "rgba(3, 7, 18, 0.65)",
                p: 1.4,
                borderRadius: 2,
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: "#38bdf8",
                  wordBreak: "break-all",
                }}
              >
                {account?.alias}
              </Typography>
              <Tooltip
                title={copiedField === "alias" ? "¡Copiado!" : "Copiar Alias"}
              >
                <IconButton
                  size="small"
                  onClick={() => handleCopy(account?.alias, "alias")}
                  sx={{
                    color: copiedField === "alias" ? "#10b981" : "#9ca3af",
                    bgcolor: "rgba(255, 255, 255, 0.04)",
                    "&:hover": {
                      bgcolor: "rgba(56, 189, 248, 0.15)",
                      color: "#38bdf8",
                    },
                  }}
                  aria-label="Copiar Alias"
                >
                  {copiedField === "alias" ? (
                    <Check fontSize="small" />
                  ) : (
                    <ContentCopy fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* CVU */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "#9ca3af",
                display: "block",
                fontWeight: 700,
                fontSize: "0.68rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                mb: 0.8,
              }}
            >
              CVU (22 DÍGITOS - INMODIFICABLE)
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "rgba(3, 7, 18, 0.65)",
                p: 1.4,
                borderRadius: 2,
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "#f3f4f6",
                  fontFamily: "monospace",
                  fontSize: { xs: "0.8rem", sm: "0.95rem" },
                  wordBreak: "break-all",
                  letterSpacing: "-0.5px",
                }}
              >
                {account?.cvu}
              </Typography>
              <Tooltip
                title={copiedField === "cvu" ? "¡Copiado!" : "Copiar CVU"}
              >
                <IconButton
                  size="small"
                  onClick={() => handleCopy(account?.cvu, "cvu")}
                  sx={{
                    color: copiedField === "cvu" ? "#10b981" : "#9ca3af",
                    bgcolor: "rgba(255, 255, 255, 0.04)",
                    "&:hover": {
                      bgcolor: "rgba(56, 189, 248, 0.15)",
                      color: "#38bdf8",
                    },
                  }}
                  aria-label="Copiar CVU"
                >
                  {copiedField === "cvu" ? (
                    <Check fontSize="small" />
                  ) : (
                    <ContentCopy fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 2.5,
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          Se ha enviado un correo de confirmación a{" "}
          <strong style={{ color: "rgba(255, 255, 255, 0.85)" }}>
            {email}
          </strong>
          .
        </Typography>
      </DialogContent>

      <DialogActions sx={{ pb: 3, px: 3, pt: 1, justifyContent: "center" }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={onClose}
          sx={{
            borderRadius: 2.5,
            py: 1.3,
            fontWeight: 700,
            fontSize: "1rem",
            background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
            color: "#030303",
            boxShadow: "0 4px 20px rgba(56, 189, 248, 0.4)",
            "&:hover": {
              background: "linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)",
              boxShadow: "0 6px 28px rgba(56, 189, 248, 0.55)",
            },
          }}
        >
          Aceptar y Comenzar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
