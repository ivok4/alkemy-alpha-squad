import { useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Divider,
  Box,
} from "@mui/material";
import {
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as ArrowDownIcon,
  PeopleAlt as PeopleIcon,
} from "@mui/icons-material";
import { AccountBalanceWallet } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AuthContext from "../Contexts/AuthContext";
import NotificationsPopover from "./NotificationsPopover";

function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { userRole } = useContext(AuthContext);

  const role = userRole || localStorage.getItem("userRole");
  const isAdmin = role === "Administrador" || (Array.isArray(role) && role.includes("Administrador"));
  const { userData, logout } = useContext(AuthContext);

  // Handlers to open and close the menu
  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Simulated navigation handler
  const handleNavigate = (page) => {
    navigate(`/${page}`, { replace: true });
    handleClose();
  };

  async function handleLogout() {
    try {
      const response = await fetch("http://localhost:5016/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        logout();
        window.location.href = "/auth";
      } else {
        const errorData = await response.json();
        console.error("Error al cerrar sesión:", errorData);
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(10, 10, 15, 0.65)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        zIndex: 10,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between",
    px: { xs: 1, sm: 3 },
    gap: { xs: 0.5, sm: 2 },}}>
        <AccountBalanceWallet
          sx={{display: "block" ,
    mr: { xs: 0.5, sm: 1.5 },
    fontSize: 28,
     color: "#38bdf8" }}
        />
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#f3f4f6",
            fontSize: { xs: "0.85rem", sm: "1.1rem" }, 
    flexGrow:  1 ,
          }}
        >
          DigitalArs
        </Typography>

        <Box>
          <ListItemButton
            component="a"
            href="/dashboard"
            sx={{
              borderRadius: 2,
              color: "#9ca3af",
              px: { xs: 1, sm: 2 },  
      py: 0.5,
      minWidth: "auto",    
              "&:hover": { color: "#f3f4f6", bgcolor: "rgba(255,255,255,0.04)" },
            }}
          >
            <ListItemText
              primary="Inicio"
              primaryTypographyProps={{ fontWeight: 500, fontSize: { xs: "0.8rem", sm: "0.9rem" },}}
            />
          </ListItemButton>
        </Box>
        <Box>
          <ListItemButton
            component="a"
            href="/transactionHistory"
            sx={{
              borderRadius: 2,
              color: "#9ca3af",
              px: { xs: 1, sm: 2 },  
      py: 0.5,
      minWidth: "auto",
              "&:hover": { color: "#f3f4f6", bgcolor: "rgba(255,255,255,0.04)" },
            }}
          >
            <ListItemText
              primary="Historial"
              primaryTypographyProps={{ fontWeight: 500, fontSize: { xs: "0.8rem", sm: "0.9rem" }, }}
            />
          </ListItemButton>
        </Box>
        {isAdmin && (
          <Box>
            <ListItemButton
              component="a"
              href="/users"
              sx={{
                borderRadius: 2,
                color: "#9ca3af",
                "&:hover": { color: "#f3f4f6", bgcolor: "rgba(255,255,255,0.04)" },
              }}
            >
              <ListItemText
                primary="Usuarios"
                primaryTypographyProps={{ fontWeight: 500, fontSize: "0.9rem" }}
              />
            </ListItemButton>
          </Box>
        )}


        <Box sx={{ mr: 1.5, ml: 1 }}>
          <NotificationsPopover />
        </Box>

        <Box>
          <Button
            onClick={handleProfileClick}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            sx={{
              textTransform: "none",
              borderRadius: "9999px",
              minWidth: "auto", 
      padding: { xs: "2px 4px", sm: "4px 12px 4px 4px" },
              bgcolor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.08)",
                borderColor: "rgba(56, 189, 248, 0.2)",
              },
            }}
          >
            <Avatar sx={{ width: { xs: 28, sm: 36 }, 
        height: { xs: 28, sm: 36 },
        mr: { xs: 0.5, sm: 1.5 }, background:"linear-gradient(135deg, #38bdf8 0%, #1d4ed8 100%)" }}>
              {userData?.firstName?.charAt(0)}
              {userData?.lastName?.charAt(0)}
            </Avatar>

            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#f3f4f6",
                display: { xs: "none", sm: "block" },
                mr: 0.5,
              }}
            >
              {userData?.firstName} {userData?.lastName}
            </Typography>
            <ArrowDownIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
          </Button>

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: "visible",
                  mt: 1.5,
                  borderRadius: "16px",
                  minWidth: 220,
                  bgcolor: "rgba(10, 10, 15, 0.9)",
                  backdropFilter: "blur(30px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {/* User Info Header inside Dropdown */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "#f3f4f6" }}
              >
                {userData?.firstName} {userData?.lastName}
              </Typography>
            </Box>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

            {/* Dropdown Navigation Links */}
            <MenuItem onClick={() => handleNavigate("dashboard")}>
              <ListItemIcon>
                <DashboardIcon fontSize="small" sx={{ color: "#38bdf8" }} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              />
            </MenuItem>

            {isAdmin && (
              <MenuItem onClick={() => handleNavigate("users")}>
                <ListItemIcon>
                  <PeopleIcon fontSize="small" sx={{ color: "#38bdf8" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Gestión de Usuarios"
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                />
              </MenuItem>
            )}

            <MenuItem onClick={() => handleNavigate("Profile")}>
              <ListItemIcon>
                <PersonIcon fontSize="small" sx={{ color: "#38bdf8" }} />
              </ListItemIcon>
              <ListItemText
                primary="Mi Perfil"
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              />
            </MenuItem>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

            <MenuItem
              onClick={(e) => handleLogout(e)}
              sx={{
                color: "#ef4444",
                "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.08)" },
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: "#ef4444" }} />
              </ListItemIcon>
              <ListItemText
                primary="Cerrar Sesión"
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
