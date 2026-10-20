import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  PeopleAltOutlined as UsersIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Refresh as RefreshIcon,
  VisibilityOutlined as ViewDetailIcon,
  PersonAddAlt1Outlined as PersonAddIcon,
  EditOutlined as EditIcon,
  BlockOutlined as BlockIcon,
  CheckCircleOutlined as CheckCircleOutlinedIcon,
} from "@mui/icons-material";
import userService from "../services/userService";
import UserDetailModal from "../Components/UserDetailModal";
import CreateUserModal from "../Components/CreateUserModal";
import EditUserModal from "../Components/EditUserModal";

function UsersList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

  // Modal de detalle de usuario
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Modal de creación de usuario
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Modal de edición de usuario
  const [userToEdit, setUserToEdit] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Diálogo de confirmación de activación / desactivación
  const [statusDialogUser, setStatusDialogUser] = useState(null);
  const [statusDialogLoading, setStatusDialogLoading] = useState(false);

  const handleOpenDetail = (userId) => {
    setSelectedUserId(userId);
    setModalOpen(true);
  };

  const handleCloseDetail = () => {
    setModalOpen(false);
    setSelectedUserId(null);
  };

  const handleOpenEdit = (user) => {
    setUserToEdit(user);
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setUserToEdit(null);
  };

  const handleOpenStatusConfirm = (user) => {
    setStatusDialogUser(user);
  };

  const handleCloseStatusConfirm = () => {
    if (statusDialogLoading) return;
    setStatusDialogUser(null);
  };

  const handleConfirmStatusChange = async () => {
    if (!statusDialogUser) return;
    try {
      setStatusDialogLoading(true);
      const newStatus = !statusDialogUser.isActive;
      await userService.updateUserStatus(statusDialogUser.id, newStatus);

      setUsuarios((prev) =>
        prev.map((u) => (u.id === statusDialogUser.id ? { ...u, isActive: newStatus } : u))
      );

      setSuccessMessage(
        newStatus
          ? `Usuario ${statusDialogUser.firstName} ${statusDialogUser.lastName} reactivado con éxito.`
          : `Usuario ${statusDialogUser.firstName} ${statusDialogUser.lastName} desactivado con éxito.`
      );

      setStatusDialogUser(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Error al modificar el estado del usuario.";
      setError(msg);
      setStatusDialogUser(null);
    } finally {
      setStatusDialogLoading(false);
    }
  };

  const handleUserUpdated = (updatedUser) => {
    setSuccessMessage(
      `Usuario ${updatedUser.firstName} ${updatedUser.lastName} actualizado con éxito.`
    );
    setUsuarios((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const handleUserCreated = (createdUser) => {
    setSuccessMessage(`Usuario ${createdUser.firstName} ${createdUser.lastName} creado con éxito.`);
    fetchUsuarios(1);
    setPagina(1);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const fetchUsuarios = async (pageToFetch = pagina) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5016/api/User?pagina=${pageToFetch}&porPagina=${porPagina}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error("No tienes permisos suficientes para acceder a esta sección.");
      }

      if (!response.ok) {
        throw new Error("Error al obtener el listado de usuarios.");
      }

      const data = await response.json();
      setUsuarios(data.usuarios || []);
      setTotalPaginas(data.totalPaginas || 1);
      setTotalRegistros(data.totalRegistros || 0);
    } catch (err) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios(pagina);
  }, [pagina]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        animation: "fadeInUp 0.6s ease both",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                display: "inline-flex",
                p: 1,
                borderRadius: "12px",
                bgcolor: "rgba(56, 189, 248, 0.12)",
              }}
            >
              <UsersIcon sx={{ fontSize: 26, color: "#38bdf8" }} />
            </Box>
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: 700, color: "#f3f4f6" }}
            >
              Usuarios del Sistema
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#9ca3af" }}>
            Lista de usuarios con rol Usuario y su estado actual en la plataforma
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setCreateModalOpen(true)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              px: 2.2,
              py: 0.9,
              bgcolor: "#38bdf8",
              color: "#0a0a0f",
              "&:hover": {
                bgcolor: "#0284c7",
              },
            }}
          >
            Nuevo Usuario
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchUsuarios(pagina)}
            disabled={loading}
            sx={{
              borderColor: "rgba(255,255,255,0.1)",
              color: "#f3f4f6",
              textTransform: "none",
              borderRadius: "10px",
              py: 0.9,
              "&:hover": {
                borderColor: "#38bdf8",
                bgcolor: "rgba(56, 189, 248, 0.08)",
              },
            }}
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {/* Success Alert */}
      {successMessage && (
        <Alert severity="success" sx={{ borderRadius: "12px" }}>
          {successMessage}
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ borderRadius: "12px" }}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Card
        sx={{
          bgcolor: "rgba(18, 18, 26, 0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 10,
            }}
          >
            <CircularProgress size={36} sx={{ color: "#38bdf8" }} />
          </Box>
        ) : usuarios.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, px: 3 }}>
            <Typography variant="h6" sx={{ color: "#9ca3af", fontWeight: 500 }}>
              No se encontraron usuarios registrados con rol Usuario.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ bgcolor: "transparent" }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.02)",
                      "& th": {
                        color: "#9ca3af",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        borderColor: "rgba(255, 255, 255, 0.06)",
                        py: 2,
                      },
                    }}
                  >
                    <TableCell>USUARIO</TableCell>
                    <TableCell>CORREO ELECTRÓNICO</TableCell>
                    <TableCell>DOCUMENTO</TableCell>
                    <TableCell>FECHA REGISTRO</TableCell>
                    <TableCell align="center">ROL</TableCell>
                    <TableCell align="center">ESTADO</TableCell>
                    <TableCell align="center">ACCIONES</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuarios.map((user) => {
                    const formattedDate = user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("es-AR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-";

                    return (
                      <TableRow
                        key={user.id}
                        sx={{
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 0.03)",
                          },
                          "& td": {
                            borderColor: "rgba(255, 255, 255, 0.05)",
                            py: 2,
                          },
                        }}
                      >
                        {/* Usuario */}
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor: "rgba(56, 189, 248, 0.15)",
                                color: "#38bdf8",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                              }}
                            >
                              {user.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
                            </Avatar>
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: "#f3f4f6",
                                  fontSize: "0.92rem",
                                }}
                              >
                                {user.firstName} {user.lastName}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#6b7280" }}
                              >
                                ID: #{user.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Email */}
                        <TableCell sx={{ color: "#d1d5db", fontSize: "0.9rem" }}>
                          {user.email}
                        </TableCell>

                        {/* Documento */}
                        <TableCell sx={{ color: "#9ca3af", fontSize: "0.9rem" }}>
                          {user.documentType ? `${user.documentType} ` : ""}
                          {user.documentNumber || "-"}
                        </TableCell>

                        {/* Fecha Registro */}
                        <TableCell sx={{ color: "#9ca3af", fontSize: "0.85rem" }}>
                          {formattedDate}
                        </TableCell>

                        {/* Rol */}
                        <TableCell align="center">
                          <Chip
                            label={user.role || "Usuario"}
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
                        </TableCell>

                        {/* Estado */}
                        <TableCell align="center">
                          <Chip
                            icon={
                              user.isActive ? (
                                <ActiveIcon sx={{ "&&": { color: "#10b981", fontSize: 16 } }} />
                              ) : (
                                <InactiveIcon sx={{ "&&": { color: "#ef4444", fontSize: 16 } }} />
                              )
                            }
                            label={user.isActive ? "Activo" : "Desactivado"}
                            size="small"
                            sx={{
                              bgcolor: user.isActive
                                ? "rgba(16, 185, 129, 0.12)"
                                : "rgba(239, 68, 68, 0.12)",
                              color: user.isActive ? "#10b981" : "#ef4444",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              borderRadius: "6px",
                              border: user.isActive
                                ? "1px solid rgba(16, 185, 129, 0.2)"
                                : "1px solid rgba(239, 68, 68, 0.2)",
                            }}
                          />
                        </TableCell>

                        {/* Acciones */}
                        <TableCell align="center">
                          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                            <Tooltip title="Ver detalle del usuario" arrow placement="top">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDetail(user.id)}
                                sx={{
                                  color: "#38bdf8",
                                  bgcolor: "rgba(56, 189, 248, 0.08)",
                                  border: "1px solid rgba(56, 189, 248, 0.2)",
                                  borderRadius: "8px",
                                  p: 0.9,
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    bgcolor: "rgba(56, 189, 248, 0.2)",
                                    borderColor: "#38bdf8",
                                    transform: "scale(1.08)",
                                  },
                                }}
                              >
                                <ViewDetailIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>

                            {user.role !== "Administrador" && (
                              <Tooltip title="Editar datos del usuario" arrow placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEdit(user)}
                                  sx={{
                                    color: "#a5b4fc",
                                    bgcolor: "rgba(99, 102, 241, 0.08)",
                                    border: "1px solid rgba(99, 102, 241, 0.2)",
                                    borderRadius: "8px",
                                    p: 0.9,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      bgcolor: "rgba(99, 102, 241, 0.2)",
                                      borderColor: "#818cf8",
                                      transform: "scale(1.08)",
                                    },
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            )}

                            {user.role !== "Administrador" && (
                              <Tooltip
                                title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
                                arrow
                                placement="top"
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenStatusConfirm(user)}
                                  sx={{
                                    color: user.isActive ? "#f87171" : "#34d399",
                                    bgcolor: user.isActive
                                      ? "rgba(239, 68, 68, 0.08)"
                                      : "rgba(16, 185, 129, 0.08)",
                                    border: user.isActive
                                      ? "1px solid rgba(239, 68, 68, 0.2)"
                                      : "1px solid rgba(16, 185, 129, 0.2)",
                                    borderRadius: "8px",
                                    p: 0.9,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      bgcolor: user.isActive
                                        ? "rgba(239, 68, 68, 0.2)"
                                        : "rgba(16, 185, 129, 0.2)",
                                      borderColor: user.isActive ? "#ef4444" : "#10b981",
                                      transform: "scale(1.08)",
                                    },
                                  }}
                                >
                                  {user.isActive ? (
                                    <BlockIcon sx={{ fontSize: 18 }} />
                                  ) : (
                                    <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
                                  )}
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination footer */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                p: 2.5,
                borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <Typography sx={{ color: "#9ca3af", fontSize: "0.85rem" }}>
                Mostrando {usuarios.length} de {totalRegistros} usuarios
              </Typography>

              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={pagina === 1}
                  onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
                  sx={{
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "#f3f4f6",
                    textTransform: "none",
                    borderRadius: "8px",
                    "&:hover": {
                      borderColor: "#38bdf8",
                      bgcolor: "rgba(56, 189, 248, 0.08)",
                    },
                  }}
                >
                  Anterior
                </Button>
                <Typography sx={{ color: "#9ca3af", fontSize: "0.85rem", px: 1 }}>
                  Página {pagina} de {totalPaginas || 1}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina((prev) => prev + 1)}
                  sx={{
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "#f3f4f6",
                    textTransform: "none",
                    borderRadius: "8px",
                    "&:hover": {
                      borderColor: "#38bdf8",
                      bgcolor: "rgba(56, 189, 248, 0.08)",
                    },
                  }}
                >
                  Siguiente
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Card>

      {/* Modal de Detalle de Usuario */}
      <UserDetailModal
        open={modalOpen}
        onClose={handleCloseDetail}
        userId={selectedUserId}
        onEdit={handleOpenEdit}
        onStatusChange={handleOpenStatusConfirm}
      />

      {/* Modal de Creación de Usuario */}
      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleUserCreated}
      />

      {/* Modal de Edición de Usuario */}
      <EditUserModal
        open={editModalOpen}
        onClose={handleCloseEdit}
        user={userToEdit}
        onSuccess={handleUserUpdated}
      />

      {/* Diálogo de Confirmación de Activación / Desactivación */}
      <Dialog
        open={Boolean(statusDialogUser)}
        onClose={statusDialogLoading ? undefined : handleCloseStatusConfirm}
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
              bgcolor: statusDialogUser?.isActive
                ? "rgba(239, 68, 68, 0.15)"
                : "rgba(16, 185, 129, 0.15)",
              color: statusDialogUser?.isActive ? "#ef4444" : "#10b981",
            }}
          >
            {statusDialogUser?.isActive ? (
              <BlockIcon fontSize="small" />
            ) : (
              <CheckCircleOutlinedIcon fontSize="small" />
            )}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
            {statusDialogUser?.isActive ? "¿Desactivar usuario?" : "¿Activar usuario?"}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ py: 1.5 }}>
          <Typography sx={{ color: "#d1d5db", fontSize: "0.92rem", lineHeight: 1.5, mb: 1.5 }}>
            {statusDialogUser?.isActive
              ? `¿Está seguro de que desea desactivar a ${statusDialogUser?.firstName} ${statusDialogUser?.lastName}?`
              : `¿Está seguro de que desea reactivar a ${statusDialogUser?.firstName} ${statusDialogUser?.lastName}?`}
          </Typography>

          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              bgcolor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <Typography variant="caption" sx={{ color: "#9ca3af", display: "block" }}>
              {statusDialogUser?.isActive
                ? "El usuario no podrá iniciar sesión, operar ni recibir transferencias. Sus cuentas y movimientos se mantendrán intactos."
                : "El usuario recuperará el acceso normalmente para iniciar sesión y operar en la plataforma."}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2, pt: 1, gap: 1.2 }}>
          <Button
            onClick={handleCloseStatusConfirm}
            disabled={statusDialogLoading}
            sx={{
              color: "#9ca3af",
              borderRadius: "10px",
              px: 2,
              textTransform: "none",
              fontSize: "0.88rem",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)", color: "#f3f4f6" },
            }}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleConfirmStatusChange}
            disabled={statusDialogLoading}
            variant="contained"
            sx={{
              bgcolor: statusDialogUser?.isActive ? "#ef4444" : "#10b981",
              color: "#ffffff",
              fontWeight: 700,
              borderRadius: "10px",
              px: 2.5,
              textTransform: "none",
              fontSize: "0.88rem",
              boxShadow: statusDialogUser?.isActive
                ? "0 0 16px rgba(239, 68, 68, 0.35)"
                : "0 0 16px rgba(16, 185, 129, 0.35)",
              "&:hover": {
                bgcolor: statusDialogUser?.isActive ? "#dc2626" : "#059669",
              },
            }}
          >
            {statusDialogLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                <span>Procesando...</span>
              </Box>
            ) : statusDialogUser?.isActive ? (
              "Sí, desactivar"
            ) : (
              "Sí, activar"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UsersList;
