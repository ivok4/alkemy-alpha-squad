import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Tooltip,
  Snackbar,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  AccountBalance as AccountIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  AccountBalanceWallet as WalletIcon,
  Tag as TagIcon,
  EditOutlined as EditIcon,
  BlockOutlined as BlockIcon,
  CheckCircleOutlined as CheckCircleOutlinedIcon,
} from "@mui/icons-material";
import userService from "../services/userService";

export default function UserDetailModal({
  open,
  onClose,
  userId,
  initialUserData = null,
  onEdit = () => {},
  onStatusChange = () => {},
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (open && userId) {
      fetchUserDetail(userId);
    } else if (!open) {
      setUser(null);
      setError(null);
      setCopiedField(null);
    }
  }, [open, userId]);

  const fetchUserDetail = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUserById(id);
      setUser(data);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar los detalles del usuario.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setSnackbarMessage(`${fieldName} copiado al portapapeles`);
    setSnackbarOpen(true);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const formatCurrency = (amount, currency = "ARS") => {
    if (amount === undefined || amount === null) return "-";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency || "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayUser = user || initialUserData;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "rgba(13, 17, 24, 0.96)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
            overflow: "hidden",
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2.5,
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            bgcolor: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: "10px",
                bgcolor: "rgba(56, 189, 248, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PersonIcon sx={{ color: "#38bdf8", fontSize: 22 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#f3f4f6" }}>
              Detalle del Usuario
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: "#9ca3af",
              "&:hover": {
                color: "#f3f4f6",
                bgcolor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ px: 3, py: 3 }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
                gap: 2,
              }}
            >
              <CircularProgress size={40} sx={{ color: "#38bdf8" }} />
              <Typography sx={{ color: "#9ca3af", fontSize: "0.9rem" }}>
                Consultando información del usuario...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ py: 3 }}>
              <Alert severity="error" sx={{ borderRadius: "12px", mb: 2 }}>
                {error}
              </Alert>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => fetchUserDetail(userId)}
                  sx={{ borderRadius: "8px", textTransform: "none", color: "#38bdf8" }}
                >
                  Reintentar
                </Button>
              </Box>
            </Box>
          ) : displayUser ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Profile Card Banner */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2.5,
                  borderRadius: "14px",
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 52,
                      height: 52,
                      bgcolor: "rgba(56, 189, 248, 0.18)",
                      color: "#38bdf8",
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      border: "2px solid rgba(56, 189, 248, 0.4)",
                    }}
                  >
                    {displayUser.firstName
                      ? displayUser.firstName.charAt(0).toUpperCase()
                      : "U"}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#f3f4f6" }}>
                      {displayUser.firstName} {displayUser.lastName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                      ID Usuario: #{displayUser.id}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                  <Chip
                    icon={
                      displayUser.isActive ? (
                        <ActiveIcon sx={{ "&&": { color: "#10b981", fontSize: 16 } }} />
                      ) : (
                        <InactiveIcon sx={{ "&&": { color: "#ef4444", fontSize: 16 } }} />
                      )
                    }
                    label={displayUser.isActive ? "Activo" : "Desactivado"}
                    size="small"
                    sx={{
                      bgcolor: displayUser.isActive
                        ? "rgba(16, 185, 129, 0.14)"
                        : "rgba(239, 68, 68, 0.14)",
                      color: displayUser.isActive ? "#10b981" : "#ef4444",
                      fontWeight: 600,
                      borderRadius: "6px",
                      border: displayUser.isActive
                        ? "1px solid rgba(16, 185, 129, 0.25)"
                        : "1px solid rgba(239, 68, 68, 0.25)",
                    }}
                  />
                  <Chip
                    label={displayUser.role || "Usuario"}
                    size="small"
                    sx={{
                      bgcolor: "rgba(56, 189, 248, 0.1)",
                      color: "#38bdf8",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      borderRadius: "6px",
                      border: "1px solid rgba(56, 189, 248, 0.2)",
                    }}
                  />
                </Box>
              </Box>

              {/* Personal Data Section */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#38bdf8",
                    mb: 1.5,
                  }}
                >
                  Datos Personales
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.5,
                  }}
                >
                  {/* Email */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "10px",
                      bgcolor: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <EmailIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                      <Typography variant="caption" sx={{ color: "#9ca3af", fontWeight: 600 }}>
                        Correo Electrónico
                      </Typography>
                    </Box>
                    <Typography sx={{ color: "#f3f4f6", fontSize: "0.9rem", fontWeight: 500, wordBreak: "break-all" }}>
                      {displayUser.email || "-"}
                    </Typography>
                  </Box>

                  {/* Documento */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "10px",
                      bgcolor: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <BadgeIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                      <Typography variant="caption" sx={{ color: "#9ca3af", fontWeight: 600 }}>
                        Documento ({displayUser.documentType || "DNI"})
                      </Typography>
                    </Box>
                    <Typography sx={{ color: "#f3f4f6", fontSize: "0.9rem", fontWeight: 500 }}>
                      {displayUser.documentNumber || "-"}
                    </Typography>
                  </Box>

                  {/* Fecha de Registro */}
                  <Box
                    sx={{
                      gridColumn: { sm: "span 2" },
                      p: 1.5,
                      borderRadius: "10px",
                      bgcolor: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                      <Typography variant="caption" sx={{ color: "#9ca3af", fontWeight: 600 }}>
                        Fecha de Registro
                      </Typography>
                    </Box>
                    <Typography sx={{ color: "#f3f4f6", fontSize: "0.9rem", fontWeight: 500 }}>
                      {formatDate(displayUser.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.06)" }} />

              {/* Account Data Section */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#38bdf8",
                    mb: 1.5,
                  }}
                >
                  Información de la Cuenta
                </Typography>

                {displayUser.account ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {/* Saldo y Cuenta ID */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        bgcolor: "rgba(56, 189, 248, 0.05)",
                        border: "1px solid rgba(56, 189, 248, 0.15)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <WalletIcon sx={{ color: "#38bdf8", fontSize: 24 }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: "#9ca3af", fontWeight: 600 }}>
                            Saldo Disponible ({displayUser.account.currency || "ARS"})
                          </Typography>
                          <Typography sx={{ color: "#f3f4f6", fontSize: "1.2rem", fontWeight: 700 }}>
                            {formatCurrency(displayUser.account.balance, displayUser.account.currency)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="caption" sx={{ color: "#9ca3af", display: "block" }}>
                          N° Cuenta
                        </Typography>
                        <Typography sx={{ color: "#38bdf8", fontWeight: 700, fontSize: "0.95rem" }}>
                          #{displayUser.account.id}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Alias de la cuenta */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "10px",
                        bgcolor: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.3 }}>
                          <TagIcon sx={{ fontSize: 15, color: "#9ca3af" }} />
                          <Typography variant="caption" sx={{ color: "#9ca3af", fontWeight: 600 }}>
                            Alias de la Cuenta
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            color: "#38bdf8",
                            fontFamily: "monospace",
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            letterSpacing: "0.02em",
                            wordBreak: "break-all",
                          }}
                        >
                          {displayUser.account.alias || "No asignado"}
                        </Typography>
                      </Box>

                      {displayUser.account.alias && (
                        <Tooltip title={copiedField === "Alias" ? "¡Copiado!" : "Copiar Alias"}>
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(displayUser.account.alias, "Alias")}
                            sx={{
                              color: copiedField === "Alias" ? "#10b981" : "#9ca3af",
                              bgcolor: "rgba(255, 255, 255, 0.04)",
                              "&:hover": {
                                color: "#38bdf8",
                                bgcolor: "rgba(56, 189, 248, 0.1)",
                              },
                            }}
                          >
                            {copiedField === "Alias" ? (
                              <CheckIcon fontSize="small" />
                            ) : (
                              <CopyIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    {/* CVU (22 dígitos) */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "10px",
                        bgcolor: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.3 }}>
                          <AccountIcon sx={{ fontSize: 15, color: "#9ca3af" }} />
                          <Typography variant="caption" sx={{ color: "#9ca3af", fontWeight: 600 }}>
                            CVU (22 dígitos)
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            color: "#f3f4f6",
                            fontFamily: "monospace",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                            letterSpacing: "0.05em",
                            wordBreak: "break-all",
                          }}
                        >
                          {displayUser.account.cvu || "No asignado"}
                        </Typography>
                      </Box>

                      {displayUser.account.cvu && (
                        <Tooltip title={copiedField === "CVU" ? "¡Copiado!" : "Copiar CVU"}>
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(displayUser.account.cvu, "CVU")}
                            sx={{
                              color: copiedField === "CVU" ? "#10b981" : "#9ca3af",
                              bgcolor: "rgba(255, 255, 255, 0.04)",
                              "&:hover": {
                                color: "#38bdf8",
                                bgcolor: "rgba(56, 189, 248, 0.1)",
                              },
                            }}
                          >
                            {copiedField === "CVU" ? (
                              <CheckIcon fontSize="small" />
                            ) : (
                              <CopyIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: "10px" }}>
                    Este usuario no posee una cuenta bancaria asignada actualmente.
                  </Alert>
                )}
              </Box>
            </Box>
          ) : null}
        </DialogContent>

        {/* Footer actions */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            bgcolor: "rgba(255, 255, 255, 0.01)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {displayUser && displayUser.role !== "Administrador" ? (
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                onClick={() => {
                  onClose();
                  onEdit(displayUser);
                }}
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{
                  borderColor: "rgba(56, 189, 248, 0.3)",
                  color: "#38bdf8",
                  borderRadius: "10px",
                  px: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  "&:hover": {
                    borderColor: "#38bdf8",
                    bgcolor: "rgba(56, 189, 248, 0.1)",
                  },
                }}
              >
                Editar Usuario
              </Button>

              <Button
                onClick={() => {
                  onClose();
                  onStatusChange(displayUser);
                }}
                variant="outlined"
                startIcon={displayUser.isActive ? <BlockIcon /> : <CheckCircleOutlinedIcon />}
                sx={{
                  borderColor: displayUser.isActive
                    ? "rgba(239, 68, 68, 0.3)"
                    : "rgba(16, 185, 129, 0.3)",
                  color: displayUser.isActive ? "#f87171" : "#34d399",
                  borderRadius: "10px",
                  px: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  "&:hover": {
                    borderColor: displayUser.isActive ? "#ef4444" : "#10b981",
                    bgcolor: displayUser.isActive
                      ? "rgba(239, 68, 68, 0.1)"
                      : "rgba(16, 185, 129, 0.1)",
                  },
                }}
              >
                {displayUser.isActive ? "Desactivar" : "Activar"}
              </Button>
            </Box>
          ) : (
            <Box />
          )}

          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: "rgba(255, 255, 255, 0.15)",
              color: "#f3f4f6",
              borderRadius: "10px",
              px: 3,
              textTransform: "none",
              fontSize: "0.88rem",
              "&:hover": {
                borderColor: "#38bdf8",
                bgcolor: "rgba(56, 189, 248, 0.08)",
              },
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback for copying */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
