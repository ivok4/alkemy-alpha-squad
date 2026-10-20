import { useState } from "react";
import RegisterForm from "../Components/RegisterForm";
import LoginForm from "../Components/LoginForm";
import FirstLoginForm from "../Components/FirstLoginForm";
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import { LoginOutlined, PersonAddOutlined } from "@mui/icons-material";
import AuraBackground from "../Components/AuraBackground";

function AuthComponent() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authTab, setAuthTab] = useState("login");

  return (
    <>
      {/* Background */}
      <AuraBackground variant="animated" />

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Main Content */}
        <Container
          maxWidth={currentUser ? "lg" : "sm"}
          sx={{
            flexGrow: 1,
            py: { xs: 4, sm: 6 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {currentUser ? (
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              color="primary.main"
              gutterBottom
            >
              Logeado
            </Typography>
          ) : (
            <Box>
              {/* Header */}
              <Box sx={{ textAlign: "center", mb: 3.5 }}>
                {/* Logo badge */}
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: "rgba(56, 189, 248, 0.12)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    borderRadius: "999px",
                    px: 2.5,
                    py: 0.8,
                    mb: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#38bdf8",
                      boxShadow: "0 0 8px #38bdf8",
                      animation: "authPulse 2s infinite",
                      "@keyframes authPulse": {
                        "0%, 100%": { boxShadow: "0 0 8px #38bdf8" },
                        "50%": {
                          boxShadow:
                            "0 0 18px #38bdf8, 0 0 30px rgba(56,189,248,0.4)",
                        },
                      },
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#7dd3fc",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    Tu billetera digital en pesos
                  </Typography>
                </Box>

                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                    background:
                      "linear-gradient(135deg, #7dd3fc 0%, #38bdf8 50%, #0ea5e9 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    mb: 1,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Digital·Ars
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: "rgba(255,255,255,0.6)",
                    maxWidth: 420,
                    mx: "auto",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  Tu billetera virtual simple, segura y al instante.
                </Typography>

                {/* Tabs Switcher */}
                {/* Tabs Switcher */}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Tabs
                    value={authTab === "first-login" ? false : authTab}
                    onChange={(e, val) => setAuthTab(val)}
                    textColor="primary"
                    indicatorColor="primary"
                    variant="fullWidth"
                    sx={{
                      width: "100%",
                      maxWidth: 400,
                      bgcolor: "rgba(13, 17, 24, 0.9)",
                      backdropFilter: "blur(12px)",
                      borderRadius: 3,
                      p: 0.5,
                      border: "1px solid rgba(255,255,255,0.08)",
                      "& .MuiTabs-indicator": {
                        height: "100%",
                        borderRadius: 2.5,
                        zIndex: 1,
                        bgcolor: "primary.main",
                        boxShadow: "0 4px 16px rgba(56,189,248,0.4)",
                      },
                    }}
                  >
                    <Tab
                      value="login"
                      icon={<LoginOutlined />}
                      iconPosition="start"
                      label="Iniciar Sesión"
                      sx={{
                        flex: 1,
                        textTransform: "none",
                        fontWeight: "bold",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        zIndex: 2,
                        minHeight: 44,
                        px: { xs: 1, sm: 2 },
                        color: "rgba(255,255,255,0.6)",
                        transition: "color 0.2s",
                        "&.Mui-selected": { color: "#030303 !important" },
                      }}
                    />
                    <Tab
                      value="register"
                      icon={<PersonAddOutlined />}
                      iconPosition="start"
                      label="Crear Cuenta"
                      sx={{
                        flex: 1,
                        textTransform: "none",
                        fontWeight: "bold",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        zIndex: 2,
                        minHeight: 44,
                        px: { xs: 1, sm: 2 },
                        color: "rgba(255,255,255,0.6)",
                        transition: "color 0.2s",
                        "&.Mui-selected": { color: "#030303 !important" },
                      }}
                    />
                  </Tabs>
                </Box>
              </Box>
              {/* Form card - Less transparent with rich dark surface and crisp border */}
              <Box
                sx={{
                  maxWidth: authTab === "register" ? 660 : 440,
                  mx: "auto",
                  bgcolor: "rgba(13, 17, 24, 0.92)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 4,
                  p: { xs: 3, sm: 4 },
                  boxShadow:
                    "0 24px 64px rgba(0,0,0,0.6), 0 0 30px rgba(56,189,248,0.06)",
                  transition: "max-width 0.3s ease",
                }}
              >
                {authTab === "login" && (
                  <LoginForm
                    onToggleRegister={() => setAuthTab("register")}
                    onToggleFirstLogin={() => setAuthTab("first-login")}
                  />
                )}
                {authTab === "register" && (
                  <RegisterForm onToggleLogin={() => setAuthTab("login")} />
                )}
                {authTab === "first-login" && (
                  <FirstLoginForm onToggleLogin={() => setAuthTab("login")} />
                )}
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
}

export default AuthComponent;
