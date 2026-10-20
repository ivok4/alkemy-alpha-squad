import { useEffect, useState, useContext } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Snackbar,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import {
  AccountCircle,
  CheckCircle,
  CreditCard,
  Description,
  Edit,
  Email,
  Save,
  Security,
} from "@mui/icons-material";

import accountService from "../services/accountService";
import AccountDataCard from "../Components/AccountDataCard";
import DetailCard from "../Components/DetailCard";
import AuthContext from "../Contexts/AuthContext";

function Profile() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [activeEdit, setActiveEdit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [errors, setErrors] = useState({});
  const [copiedField, setCopiedField] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const { setUserData } = useContext(AuthContext);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError("");

      try {
        const [accountData, profileData] = await Promise.all([
          accountService.getMyAccount(),
          accountService.getProfile(),
        ]);

        const mergedData = {
          ...accountData,
          ...profileData,
        };

        setUser(mergedData);
        setFormData(mergedData);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Sesión expirada. Vuelva a iniciar sesión.");
        } else {
          setError("No se pudo obtener la información de la cuenta.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };


  const handleSavePersonal = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.firstName?.trim())
      newErrors.firstName = "El nombre es requerido.";
    if (!formData.lastName?.trim())
      newErrors.lastName = "El apellido es requerido.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: user.email,
      };

      await accountService.updateUserProfile(payload);

      setUser({
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      setUserData({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      setSuccessMessage("Nombre y apellido actualizados correctamente.");
      setSnackbarOpen(true);
      setActiveEdit(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al actualizar datos personales.",
      );
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
const handleSaveProfile = async (e, tipo) => {
    if (e) e.preventDefault();
    
    const newErrors = {};
    let payload = {};
    let successMsg = "";


    if (tipo === "personal") {
      if (!formData.firstName?.trim()) newErrors.firstName = "El nombre es requerido.";
      if (!formData.lastName?.trim()) newErrors.lastName = "El apellido es requerido.";
      
      payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: user.email,
      };
      successMsg = "Nombre y apellido actualizados correctamente.";

    } else if (tipo === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email || "")) newErrors.email = "Ingrese un email válido.";
      if (formData.email !== user.email && !formData.contrasenaActual) {
        newErrors.contrasenaActual = "Requerida para cambiar el email.";
      }
      

      if (formData.email === user.email) {
        handleCloseEmailDialog();
        return;
      }

      payload = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: formData.email,
        contrasenaActual: formData.contrasenaActual,
      };
      successMsg = "Email actualizado correctamente.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await accountService.updateUserProfile(payload); 

      if (tipo === "personal") {
        setUser({ ...user, firstName: formData.firstName, lastName: formData.lastName });
        setUserData({ firstName: formData.firstName, lastName: formData.lastName });
        setActiveEdit(null);
      } else if (tipo === "email") {
        setUser({ ...user, email: formData.email });
        setOpenEmailDialog(false);
        setActiveEdit(null)
      }

      setSuccessMessage(successMsg);
      setSnackbarOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar el perfil.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };


  //UPDATE: ALIAS
  const handleSaveAlias = async () => {
    const newErrors = {};
    const aliasRegex = /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/;

    if (!aliasRegex.test(formData.alias || "")) {
      newErrors.alias = "Formato inválido (ej: auto.perro.gato).";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log(newErrors);
      return;
    }

    setLoading(true);
    try {
      await accountService.updateAlias({ alias: formData.alias });
      setUser({ ...user, alias: formData.alias });
      setSuccessMessage("Alias actualizado correctamente.");
      setSnackbarOpen(true);
      setActiveEdit(null);
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar el alias.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setActiveEdit(null);
    setFormData({ ...user, contrasenaActual: "" });
    setErrors({});
    setIsEditing(false);
  };

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedField(fieldName);

      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch {
      setError("No se pudo copiar el dato.");
    }
  };

  const handleEdit = (e,section) => {
    e.preventDefault();
    setActiveEdit(section);
    setFormData({ ...user, contrasenaActual: "" });
    setErrors({});
    setError("");
  };

  const handleOpenEmailDialog = () => {
    setFormData({ ...user, email: user.email, contrasenaActual: "" });
    setErrors({});
    setError("");
    setOpenEmailDialog(true);
  };

  const handleCloseEmailDialog = () => {
    setOpenEmailDialog(false);
    setFormData({ ...user, contrasenaActual: "" });
    setActiveEdit(null)
    setErrors({});
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Typography color="text.secondary">Cargando información...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
      }}
    >
      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
        }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 3,
            }}
          >
            {error}
          </Alert>
        )}

        <Paper
          elevation={6}
          sx={{
            overflow: "hidden",
            borderRadius: 4,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          {/* HEADER */}

          <Box
            sx={{
              background: "linear-gradient(90deg, #1e293b 0%, #0f172a 100%)",
              p: {
                xs: 3,
                sm: 4,
              },
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                alignItems: {
                  xs: "flex-start",
                  sm: "center",
                },
                justifyContent: "space-between",
                gap: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: {
                      xs: 64,
                      sm: 76,
                    },
                    height: {
                      xs: 64,
                      sm: 76,
                    },
                    borderRadius: 3,
                    background:
                      "linear-gradient(135deg, #38bdf8 0%, #1d4ed8 100%)",
                    color: "#030712",
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                  }}
                >
                  {user.firstName?.charAt(0)}
                  {user.lastName?.charAt(0)}
                </Avatar>

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography variant="h5" fontWeight={700}>
                      {user.firstName} {user.lastName}
                    </Typography>

                    <Chip
                      icon={<CheckCircle />}
                      label={user.estado || "Activo"}
                      size="small"
                      sx={{
                        bgcolor: "rgba(59,130,246,0.1)",
                        color: "#60a5fa",
                        border: "1px solid rgba(59,130,246,0.2)",
                        fontWeight: 600,
                        "& .MuiChip-icon": {
                          color: "#60a5fa",
                        },
                      }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              {!isEditing && (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={(e) => handleEdit(e,"personal")}
                  sx={{
                    mt: 2,
                    py: 1.3,
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  Editar Perfil
                </Button>
              )}
            </Box>
          </Box>

          {/* CONTENT */}

          <Box
            sx={{
              p: {
                xs: 3,
                sm: 5,
              },
            }}
          >
            {/* DETAIL CARDS */}

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DetailCard
                  icon={
                    <AccountCircle sx={{ fontSize: 24, color: "#38bdf8" }} />
                  }
                  title="NOMBRE COMPLETO"
                  value={`${user.firstName} ${user.lastName}`}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DetailCard
                  icon={<Email sx={{ fontSize: 24, color: "#38bdf8" }} />}
                  title="CORREO ELECTRÓNICO"
                  value={user.email}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DetailCard
                  icon={<Description sx={{ fontSize: 24, color: "#38bdf8" }} />}
                  title="DOCUMENTO DE IDENTIDAD"
                  value={`${user.documentType} ${user.documentNumber}`}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DetailCard
                  icon={<Security sx={{ fontSize: 24, color: "#38bdf8" }} />}
                  title="ESTADO DE CUENTA"
                  value={user.estado}
                  valueColor="#34d399"
                  status
                />
              </Grid>
            </Grid>

            {/* EDIT FORM */}

            {activeEdit === "personal" ? (
              <Box
                component="form"
                onSubmit={(e)=> handleSaveProfile(e, "personal")}
                sx={{
                  mt: 4,
                  pt: 4,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: {
                      xs: "flex-start",
                      sm: "center",
                    },
                    flexDirection: {
                      xs: "column",
                      sm: "row",
                    },
                    gap: 1,
                    mb: 4,
                  }}
                >
                  <Typography variant="h6" fontWeight={700}>
                    Modificar Datos Personales
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      name="firstName"
                      value={formData.firstName || ""}
                      onChange={handleChange}
                      error={Boolean(errors.firstName)}
                      helperText={errors.firstName}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Apellido"
                      name="lastName"
                      value={formData.lastName || ""}
                      onChange={handleChange}
                      error={Boolean(errors.lastName)}
                      helperText={errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={handleOpenEmailDialog}
                      sx={{
                        mt: 2,
                        py: 1.3,
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      Editar email
                    </Button>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 4,
                    pt: 3,
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{
                      borderRadius: 3,
                      textTransform: "none",
                      px: 3,
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleSavePersonal}
                    startIcon={<Save />}
                    sx={{
                      bgcolor: "#38bdf8",
                      color: "#030712",
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: "none",
                      px: 4,
                      "&:hover": {
                        bgcolor: "#34d399",
                      },
                    }}
                  >
                    Guardar Cambios
                  </Button>
                </Box>
              </Box>
            ) : (
              /* ACCOUNT DATA */

              <Box
                sx={{
                  mt: 4,
                  pt: 4,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    color: "text.secondary",
                    letterSpacing: 1,
                  }}
                >
                  <CreditCard
                    sx={{
                      color: "#38bdf8",
                      fontSize: 20,
                    }}
                  />
                  DATOS DE CUENTA
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <AccountDataCard
                      title="Alias Virtual"
                      value={user.alias}
                      copied={copiedField === "alias"}
                      onCopy={() => copyToClipboard(user.alias, "alias")}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <AccountDataCard
                      title="CVU (Clave Virtual Uniforme)"
                      value={user.cvu}
                      copied={copiedField === "cvu"}
                      onCopy={() => copyToClipboard(user.cvu, "cvu")}
                    />
                  </Grid>
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={(e) => handleEdit(e,"alias")}
                    sx={{
                      mt: 2,
                      py: 1.3,
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    Editar Alias
                  </Button>
                </Grid>
                {activeEdit === "alias" && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Alias"
                        name="alias"
                        value={formData.alias || ""}
                        onChange={handleChange}
                        error={Boolean(errors.alias)}
                        helperText={errors.alias || "Ejemplo: auto.perro.gato"}
                        sx={{
                          "& input": {
                            fontFamily: "monospace",
                          },
                        }}
                      />
                    </Grid>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 2,
                        mt: 4,
                        pt: 3,
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={handleCancel}
                        sx={{
                          borderRadius: 3,
                          textTransform: "none",
                          px: 3,
                        }}
                      >
                        Cancelar
                      </Button>

                      <Button
                        onClick={handleSaveAlias}
                        variant="contained"
                        startIcon={<Save />}
                        sx={{
                          bgcolor: "#38bdf8",
                          color: "#030712",
                          fontWeight: 700,
                          borderRadius: 3,
                          textTransform: "none",
                          px: 4,
                          "&:hover": {
                            bgcolor: "#34d399",
                          },
                        }}
                      >
                        Guardar Cambios
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      <Dialog
        open={openEmailDialog}
        onClose={handleCloseEmailDialog}
        fullWidth
        maxWidth="sm"
      >
         {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 3,
            }}
          >
            {error}
          </Alert>
        )}
        <DialogTitle
          sx={{
            fontWeight: 700,
          }}
        >
          Cambiar email
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Para cambiar tu email, ingresá el nuevo correo y confirmá tu
            contraseña actual.
          </Typography>

          <TextField
            fullWidth
            label="Nuevo email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
                error={Boolean(errors.email)}
                      helperText={errors.email}
            margin="normal"
            autoComplete="email"
          />

          <TextField
            fullWidth
            label="Contraseña actual"
            name="contrasenaActual"
            type="password"
            value={formData.contrasenaActual}
            onChange={handleChange}
              error={Boolean(errors.contrasenaActual)}
                      helperText={errors.contrasenaActualr}
            margin="normal"
            autoComplete="current-password"
          />
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            gap: 1,
          }}
        >
          <Button
         
            variant="outlined"
            onClick={handleCloseEmailDialog}
            disabled={loading}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              px: 3,
            }}
          >
            Cancelar
          </Button>

          <Button
           type="button"
            variant="contained"
            onClick={(e)=> handleSaveProfile(e, "email")}
            disabled={loading}
            startIcon={<Save />}
            sx={{
              bgcolor: "#38bdf8",
              color: "#030712",
              fontWeight: 700,
              borderRadius: 3,
              textTransform: "none",
              px: 4,
              "&:hover": {
                bgcolor: "#34d399",
              },
            }}
          >
            {loading ? "Validando..." : "Confirmar cambio"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* SUCCESS SNACKBAR */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={successMessage}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      />
    </Box>
  );
}

export default Profile;
