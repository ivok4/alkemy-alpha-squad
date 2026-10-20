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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  FormHelperText,
} from "@mui/material";
import {
  PersonAddAlt1Outlined as PersonAddIcon,
  Close as CloseIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";

function CreateUserModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    documentTypeId: 1,
    documentNumber: "",
    email: "",
  });

  const [documentTypes, setDocumentTypes] = useState([
    { id: 1, code: "DNI", name: "Documento Nacional de Identidad" },
    { id: 2, code: "PAS", name: "Pasaporte" },
  ]);

  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Fetch document types
      const fetchDocTypes = async () => {
        try {
          const res = await fetch("http://localhost:5016/api/auth/document-types");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setDocumentTypes(data);
            }
          }
        } catch {
          // Usar valores por defecto si falla la carga
        }
      };

      fetchDocTypes();
      setFormData({
        firstName: "",
        lastName: "",
        documentTypeId: 1,
        documentNumber: "",
        email: "",
      });
      setFieldErrors({});
      setApiError(null);
    }
  }, [open]);

  const selectedDocType = documentTypes.find(
    (d) => d.id === formData.documentTypeId
  );

  const validate = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "El nombre es obligatorio.";
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "El nombre debe tener al menos 2 caracteres.";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "El apellido es obligatorio.";
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "El apellido debe tener al menos 2 caracteres.";
    }

    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es obligatorio.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())
    ) {
      errors.email = "Formato de correo electrónico inválido.";
    }

    const docNum = formData.documentNumber.trim().toUpperCase();
    if (!docNum) {
      errors.documentNumber = "El número de documento es obligatorio.";
    } else if (selectedDocType?.code === "DNI") {
      if (!/^\d{7,8}$/.test(docNum)) {
        errors.documentNumber = "El DNI debe tener entre 7 y 8 dígitos numéricos.";
      }
    } else if (selectedDocType?.code === "PAS") {
      if (!/^(?:[A-Z]{3}\d{6}|[A-Z0-9]{6,12})$/.test(docNum)) {
        errors.documentNumber =
          "El Pasaporte debe tener 3 letras y 6 números o entre 6 y 12 caracteres alfanuméricos.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "documentTypeId" ? Number(value) : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setApiError(null);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5016/api/User", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          documentTypeId: formData.documentTypeId,
          documentNumber: formData.documentNumber.trim().toUpperCase(),
          email: formData.email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear el usuario.");
      }

      onSuccess(data);
      onClose();
    } catch (err) {
      setApiError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
              display: "inline-flex",
              p: 1,
              borderRadius: "12px",
              bgcolor: "rgba(56, 189, 248, 0.12)",
            }}
          >
            <PersonAddIcon sx={{ fontSize: 24, color: "#38bdf8" }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#f3f4f6" }}>
              Crear Nuevo Usuario
            </Typography>
            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              Alta manual de usuario con rol Usuario y cuenta asociada
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          disabled={loading}
          sx={{
            color: "#9ca3af",
            "&:hover": { color: "#f3f4f6", bgcolor: "rgba(255, 255, 255, 0.06)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ px: 3, py: 2, display: "flex", flexDirection: "column", gap: 2.2 }}>
          {/* Info Notice */}
          <Alert
            icon={<InfoIcon sx={{ color: "#38bdf8" }} />}
            sx={{
              bgcolor: "rgba(56, 189, 248, 0.08)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              color: "#d1d5db",
              borderRadius: "12px",
              "& .MuiAlert-message": { fontSize: "0.82rem" },
            }}
          >
            El usuario se creará con rol <strong>Usuario</strong>, una cuenta en ARS con saldo $0 y Alias/CVU autogenerados. No se define contraseña: el usuario la establecerá en su primer inicio de sesión.
          </Alert>

          {/* API Error Alert */}
          {apiError && (
            <Alert severity="error" sx={{ borderRadius: "12px" }}>
              {apiError}
            </Alert>
          )}

          {/* Nombre y Apellido */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Nombre"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={Boolean(fieldErrors.firstName)}
              helperText={fieldErrors.firstName}
              disabled={loading}
              required
              fullWidth
            />
            <TextField
              label="Apellido"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={Boolean(fieldErrors.lastName)}
              helperText={fieldErrors.lastName}
              disabled={loading}
              required
              fullWidth
            />
          </Box>

          {/* Tipo de Documento y Número */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "140px 1fr" }, gap: 2 }}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel id="doc-type-label">Tipo</InputLabel>
              <Select
                labelId="doc-type-label"
                name="documentTypeId"
                value={formData.documentTypeId}
                label="Tipo"
                onChange={handleChange}
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Número de Documento"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              error={Boolean(fieldErrors.documentNumber)}
              helperText={
                fieldErrors.documentNumber ||
                (selectedDocType?.code === "DNI"
                  ? "7 u 8 dígitos numéricos"
                  : "Formato pasaporte (ej. ABC123456)")
              }
              disabled={loading}
              required
              fullWidth
            />
          </Box>

          {/* Correo Electrónico */}
          <TextField
            label="Correo Electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            disabled={loading}
            required
            fullWidth
            autoComplete="off"
          />
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{
              borderColor: "rgba(255,255,255,0.1)",
              color: "#9ca3af",
              textTransform: "none",
              borderRadius: "10px",
              px: 2.5,
              "&:hover": {
                borderColor: "rgba(255,255,255,0.2)",
                color: "#f3f4f6",
                bgcolor: "rgba(255, 255, 255, 0.04)",
              },
            }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PersonAddIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              px: 3,
              py: 1,
            }}
          >
            {loading ? "Creando..." : "Crear Usuario"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default CreateUserModal;
