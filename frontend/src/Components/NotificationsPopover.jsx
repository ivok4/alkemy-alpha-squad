import { useState, useEffect, useCallback } from "react";
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  NotificationsNone as BellIcon,
  Notifications as BellFilledIcon,
  CallReceived as TransferReceivedIcon,
  CallMade as TransferSentIcon,
  Savings as DepositIcon,
  InfoOutlined as SystemIcon,
  DoneAll as DoneAllIcon,
  Delete as DeleteIcon,
  DeleteSweep as ClearAllIcon,
  FiberManualRecord as UnreadDotIcon,
} from "@mui/icons-material";
import notificationService from "../services/notificationService";

function getNotificationIcon(type) {
  switch (type) {
    case "transfer_received":
      return <TransferReceivedIcon sx={{ color: "#10b981", fontSize: 20 }} />;
    case "transfer_sent":
      return <TransferSentIcon sx={{ color: "#38bdf8", fontSize: 20 }} />;
    case "deposit":
      return <DepositIcon sx={{ color: "#34d399", fontSize: 20 }} />;
    default:
      return <SystemIcon sx={{ color: "#94a3b8", fontSize: 20 }} />;
  }
}

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Recién";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export default function NotificationsPopover() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  const open = Boolean(anchorEl);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching unread notification count:", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(1, 40);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteNotification = async (e, notif) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notif.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      if (!notif.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0 || clearingAll) return;
    setClearingAll(true);
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Error clearing all notifications:", err);
    } finally {
      setClearingAll(false);
    }
  };

  // Criterio de aceptación: Si hay 10 o más no leídas, mostrar '9+'
  const badgeDisplay = unreadCount >= 10 ? "9+" : unreadCount;

  return (
    <>
      <Tooltip title="Notificaciones">
        <IconButton
          onClick={handleOpen}
          sx={{
            p: 1.1,
            color: open ? "#38bdf8" : "#9ca3af",
            bgcolor: open ? "rgba(56, 189, 248, 0.12)" : "rgba(255, 255, 255, 0.04)",
            border: "1px solid",
            borderColor: open ? "rgba(56, 189, 248, 0.3)" : "rgba(255, 255, 255, 0.06)",
            borderRadius: "12px",
            transition: "all 0.2s ease",
            "&:hover": {
              color: "#f3f4f6",
              bgcolor: "rgba(255, 255, 255, 0.08)",
              borderColor: "rgba(56, 189, 248, 0.25)",
            },
          }}
          aria-label="Abrir notificaciones"
        >
          <Badge
            badgeContent={badgeDisplay}
            color="error"
            invisible={unreadCount === 0}
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: "#ef4444",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.7rem",
                minWidth: "18px",
                height: "18px",
                padding: "0 4px",
                boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)",
              },
            }}
          >
            {unreadCount > 0 ? (
              <BellFilledIcon sx={{ fontSize: 22, color: "#38bdf8" }} />
            ) : (
              <BellIcon sx={{ fontSize: 22 }} />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              width: { xs: 330, sm: 390 },
              maxHeight: 500,
              bgcolor: "rgba(13, 17, 24, 0.96)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            bgcolor: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#f3f4f6" }}>
              Notificaciones
            </Typography>
            {unreadCount > 0 && (
              <Box
                sx={{
                  px: 1,
                  py: 0.2,
                  borderRadius: "9999px",
                  bgcolor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                <Typography sx={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>
                  {unreadCount} nueva{unreadCount > 1 ? "s" : ""}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {unreadCount > 0 && (
              <Tooltip title="Marcar todas como leídas">
                <IconButton
                  size="small"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  sx={{
                    color: "#38bdf8",
                    p: 0.8,
                    borderRadius: "8px",
                    bgcolor: "rgba(56, 189, 248, 0.08)",
                    "&:hover": { bgcolor: "rgba(56, 189, 248, 0.18)" },
                  }}
                >
                  {markingAll ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <DoneAllIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </Tooltip>
            )}

            {notifications.length > 0 && (
              <Tooltip title="Borrar todas las notificaciones">
                <IconButton
                  size="small"
                  onClick={handleClearAll}
                  disabled={clearingAll}
                  sx={{
                    color: "#94a3b8",
                    p: 0.8,
                    borderRadius: "8px",
                    bgcolor: "rgba(255, 255, 255, 0.04)",
                    "&:hover": { color: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.12)" },
                  }}
                >
                  {clearingAll ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <ClearAllIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Content list */}
        <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
          {loading && notifications.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
              <CircularProgress size={28} sx={{ color: "#38bdf8" }} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, px: 3 }}>
              <BellIcon sx={{ fontSize: 40, color: "#475569", mb: 1 }} />
              <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500 }}>
                No tienes notificaciones por el momento
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Te avisaremos cuando recibas o envíes dinero
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notif, index) => (
                <Box key={notif.id}>
                  <ListItemButton
                    onClick={() => handleNotificationClick(notif)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      alignItems: "flex-start",
                      bgcolor: notif.isRead
                        ? "transparent"
                        : "rgba(56, 189, 248, 0.06)",
                      borderLeft: notif.isRead
                        ? "3px solid transparent"
                        : "3px solid #38bdf8",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: notif.isRead
                          ? "rgba(255, 255, 255, 0.04)"
                          : "rgba(56, 189, 248, 0.1)",
                        "& .delete-notif-btn": {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, mt: 0.4 }}>
                      <Box
                        sx={{
                          p: 0.8,
                          borderRadius: "10px",
                          bgcolor: notif.isRead
                            ? "rgba(255, 255, 255, 0.04)"
                            : "rgba(56, 189, 248, 0.12)",
                          display: "inline-flex",
                        }}
                      >
                        {getNotificationIcon(notif.type)}
                      </Box>
                    </ListItemIcon>

                    <ListItemText
                      sx={{ mr: 1 }}
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: notif.isRead ? 500 : 700,
                              color: notif.isRead ? "#cbd5e1" : "#f8fafc",
                              fontSize: "0.85rem",
                            }}
                          >
                            {notif.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#64748b", fontSize: "0.7rem", whiteSpace: "nowrap" }}
                          >
                            {formatDate(notif.createdAt)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{
                            color: notif.isRead ? "#94a3b8" : "#e2e8f0",
                            fontSize: "0.78rem",
                            mt: 0.3,
                            display: "block",
                            lineHeight: 1.35,
                          }}
                        >
                          {notif.message}
                        </Typography>
                      }
                    />

                    {/* Unread indicator */}
                    {!notif.isRead && (
                      <UnreadDotIcon
                        sx={{
                          fontSize: 10,
                          color: "#38bdf8",
                          mr: 0.5,
                          mt: 1.2,
                          filter: "drop-shadow(0 0 4px #38bdf8)",
                        }}
                      />
                    )}

                    {/* Individual delete button */}
                    <Tooltip title="Eliminar">
                      <IconButton
                        className="delete-notif-btn"
                        size="small"
                        onClick={(e) => handleDeleteNotification(e, notif)}
                        sx={{
                          p: 0.5,
                          color: "#64748b",
                          opacity: { xs: 1, sm: 0.5 },
                          transition: "all 0.15s ease",
                          "&:hover": {
                            color: "#ef4444",
                            bgcolor: "rgba(239, 68, 68, 0.12)",
                            opacity: 1,
                          },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </ListItemButton>
                  {index < notifications.length - 1 && (
                    <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.04)" }} />
                  )}
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
