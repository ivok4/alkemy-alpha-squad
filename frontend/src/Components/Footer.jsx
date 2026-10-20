import { Typography, Box } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        zIndex: 2,
        py: 3,
        textAlign: "center",
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        mt: "auto",
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: "#9ca3af", opacity: 0.7, fontSize: "0.85rem" }}
      >
        © {new Date().getFullYear()}{" "}
        <strong style={{ color: "#f3f4f6", fontWeight: 600 }}>
          DigitalArs
        </strong>{" "}
        · Solución Integral de Billetera Virtual
      </Typography>
    </Box>
  );
}

export default Footer;