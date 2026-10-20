import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import AuraBackground from "../Components/AuraBackground";
import { Box } from "@mui/material";

function RootLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Static dark background for clean dashboard experience */}
      <AuraBackground variant="static" />

      {/* ================= NAVBAR ================= */}
      <Navbar />

      {/* ================= CONTENIDO DINÁMICO ================= */}
      <Box
        component="main"
        sx={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 3, sm: 4 },
        }}
      >
        <Outlet />
      </Box>

      {/* ================= FOOTER ================= */}
      <Footer />
    </Box>
  );
}
export default RootLayout;
