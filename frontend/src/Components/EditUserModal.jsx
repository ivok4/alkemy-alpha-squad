import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  FormHelperText,
  Divider,
} from "@mui/material";
import {
  EditOutlined as EditIcon,
  Close as CloseIcon,
  InfoOutlined as InfoIcon,
  LockOutlined as LockIcon,
  HelpOutlined as HelpOutlineIcon,
} from "@mui/icons-material";
import userService from "../services/userService";

function EditUserModal({ open, onClose, user, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    if (open && user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
      setFieldErrors({});
      setApiError(null);
      setConfirmDialogOpen(false);
    }
  }, [open, user]);

  const validate = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "El nombre es obligatorio.";
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "El nombre debe tener al menos 2 caracteres.";
    } else if (formData.firstName.trim().length > 50) {
      errors.firstName = "El nombre no puede exceder 50 caracteres.";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "El apellido es obligatorio.";
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "El apellido debe tener al menos 2 caracteres.";
    } else if (formData.lastName.trim().length > 50) {
      errors.lastName = "El apellido no puede exceder 50 caracteres.";
    }

    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es obligatorio.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())
    ) {
      errors.email = "Formato de correo electrónico inválido.";
    } else if (formData.email.trim().length > 250) {
      errors.email = "El correo no puede exceder 250 caracteres.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (apiError) setApiError(null);
  };

  const handlePreSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validate() || !user) return;
    setConfirmDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      setLoading(true);
      setApiError(null);

      const updatedUser = await userService.updateUser(user.id, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
      });

      setConfirmDialogOpen(false);
      if (onSuccess) {
        onSuccess(updatedUser);
      }
      onClose();
    } catch (err) {
      setConfirmDialogOpen(false);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Error al actualizar los datos del usuario.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: "rgba(18, 18, 26, 0.96)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            color: "#f3f4f6",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          pt: 2.5,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "10px",
              bgcolor: "rgba(56, 189, 248, 0.12)",
              color: "#38bdf8",
            }}
          >
            <EditIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
              Editar Usuario
            </Typography>
            <Typography variant="body2" sx={{ color: "#9ca3af", fontSize: "0.8rem" }}>
              ID #{user?.id} — Rol: {user?.role || "Usuario"}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          sx={{
            color: "#9ca3af",
            "&:hover": { color: "#f3f4f6", bgcolor: "rgba(255, 255, 255, 0.06)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handlePreSubmit}>
        <DialogContent sx={{ px: 3, py: 2 }}>
          {/* Mensaje de error de la API */}
          {apiError && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                bgcolor: "rgba(239, 68, 68, 0.12)",
                color: "#fca5a5",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "10px",
                "& .MuiAlert-icon": { color: "#ef4444" },
              }}
            >
              {apiError}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>
            {/* Nombre y Apellido */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#d1d5db", fontWeight: 600, mb: 0.8, display: "block" }}
                >
                  Nombre *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.firstName)}
                  disabled={loading}
                  placeholder="Ej: Juan"
                  slotProps={{
                    input: {
                      sx: {
                        color: "#f3f4f6",
                        bgcolor: "rgba(255, 255, 255, 0.04)",
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        "& fieldset": { borderColor: "rgba(255, 255, 255, 0.12)" },
                        "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.25)" },
                        "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
                      },
                    },
                  }}
                />
                {fieldErrors.firstName && (
                  <FormHelperText sx={{ color: "#f87171", ml: 0.5 }}>
                    {fieldErrors.firstName}
                  </FormHelperText>
                )}
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#d1d5db", fontWeight: 600, mb: 0.8, display: "block" }}
                >
                  Apellido *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.lastName)}
                  disabled={loading}
                  placeholder="Ej: Pérez"
                  slotProps={{
                    input: {
                      sx: {
                        color: "#f3f4f6",
                        bgcolor: "rgba(255, 255, 255, 0.04)",
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        "& fieldset": { borderColor: "rgba(255, 255, 255, 0.12)" },
                        "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.25)" },
                        "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
                      },
                    },
                  }}
                />
                {fieldErrors.lastName && (
                  <FormHelperText sx={{ color: "#f87171", ml: 0.5 }}>
                    {fieldErrors.lastName}
                  </FormHelperText>
                )}
              </Box>
            </Box>

            {/* Email */}
            <Box>
              <Typography
                variant="caption"
                sx={{ color: "#d1d5db", fontWeight: 600, mb: 0.8, display: "block" }}
              >
                Correo Electrónico *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={Boolean(fieldErrors.email)}
                disabled={loading}
                placeholder="ejemplo@correo.com"
                slotProps={{
                  input: {
                    sx: {
                      color: "#f3f4f6",
                      bgcolor: "rgba(255, 255, 255, 0.04)",
                      borderRadius: "10px",
                      fontSize: "0.9rem",
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.12)" },
                      "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.25)" },
                      "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
                    },
                  },
                }}
              />
              {fieldErrors.email && (
                <FormHelperText sx={{ color: "#f87171", ml: 0.5 }}>
                  {fieldErrors.email}
                </FormHelperText>
              )}
            </Box>

            <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)", my: 0.5 }} />

            {/* Campos no modificables (Solo lectura) */}
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
                <LockIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                <Typography variant="caption" sx={{ color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Informacion Protegida
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: "#6b7280", display: "block" }}>
                    Tipo de Documento
                  </Typography>
                  <Typography sx={{ color: "#9ca3af", fontSize: "0.88rem", fontWeight: 500 }}>
                    {user?.documentType || "DNI"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#6b7280", display: "block" }}>
                    Número de Documento
                  </Typography>
                  <Typography sx={{ color: "#9ca3af", fontSize: "0.88rem", fontWeight: 500 }}>
                    {user?.documentNumber || "-"}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1.5,
                  pt: 1.2,
                  borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                }}
              >
                <InfoIcon sx={{ fontSize: 15, color: "#6b7280" }} />
                <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.76rem" }}>
                  El documento de identidad y las cuentas/saldos no se pueden modificar por normativas de seguridad.
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        {/* Footer */}
        <DialogActions
          sx={{
            px: 3,
            py: 2.2,
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            gap: 1.5,
          }}
        >
          <Button
            type="button"
            onClick={onClose}
            disabled={loading}
            sx={{
              color: "#9ca3af",
              borderRadius: "10px",
              px: 2.5,
              textTransform: "none",
              fontSize: "0.9rem",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)", color: "#f3f4f6" },
            }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            sx={{
              bgcolor: "#38bdf8",
              color: "#0b0f19",
              fontWeight: 700,
              borderRadius: "10px",
              px: 3,
              textTransform: "none",
              fontSize: "0.9rem",
              boxShadow: "0 0 20px rgba(56, 189, 248, 0.3)",
              "&:hover": {
                bgcolor: "#0ea5e9",
                boxShadow: "0 0 25px rgba(56, 189, 248, 0.45)",
              },
              "&.Mui-disabled": {
                bgcolor: "rgba(56, 189, 248, 0.2)",
                color: "rgba(255, 255, 255, 0.4)",
              },
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                <span>Guardando...</span>
              </Box>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>

      {/* Diálogo de Confirmación */}
      <Dialog
        open={confirmDialogOpen}
        onClose={loading ? undefined : () => setConfirmDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: "rgba(18, 18, 26, 0.98)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "18px",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.75)",
              color: "#f3f4f6",
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: "10px",
              bgcolor: "rgba(245, 158, 11, 0.15)",
              color: "#fbbf24",
            }}
          >
            <HelpOutlineIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
            ¿Confirmar cambios?
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ py: 1.5 }}>
          <Typography sx={{ color: "#d1d5db", fontSize: "0.92rem", lineHeight: 1.5, mb: 2 }}>
            ¿Está seguro de que desea realizar estos cambios en la información del usuario?
          </Typography>

          <Box
            sx={{
              p: 1.8,
              borderRadius: "10px",
              bgcolor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 0.8,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                Nombre completo:
              </Typography>
              <Typography variant="caption" sx={{ color: "#f3f4f6", fontWeight: 600 }}>
                {formData.firstName} {formData.lastName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                Correo electrónico:
              </Typography>
              <Typography variant="caption" sx={{ color: "#38bdf8", fontWeight: 600 }}>
                {formData.email}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2, pt: 1, gap: 1.2 }}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            disabled={loading}
            sx={{
              color: "#9ca3af",
              borderRadius: "10px",
              px: 2,
              textTransform: "none",
              fontSize: "0.88rem",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)", color: "#f3f4f6" },
            }}
          >
            Volver
          </Button>

          <Button
            onClick={handleConfirmSave}
            disabled={loading}
            variant="contained"
            sx={{
              bgcolor: "#38bdf8",
              color: "#0b0f19",
              fontWeight: 700,
              borderRadius: "10px",
              px: 2.5,
              textTransform: "none",
              fontSize: "0.88rem",
              boxShadow: "0 0 16px rgba(56, 189, 248, 0.3)",
              "&:hover": {
                bgcolor: "#0ea5e9",
                boxShadow: "0 0 22px rgba(56, 189, 248, 0.45)",
              },
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                <span>Guardando...</span>
              </Box>
            ) : (
              "Sí, confirmar"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EditUserModal;
