import {
  Box,
  Paper,
  Typography,
} from "@mui/material";
function DetailCard({ icon, title, value, valueColor, status = false }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: "rgba(2,6,23,0.5)",
        borderColor: "rgba(255,255,255,0.06)",
        display: "flex",
        gap: 2,
        alignItems: "flex-start",
        height: "100%",
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: "rgba(16,185,129,0.1)",
          color: "38bdf8",
          display: "flex",
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          sx={{
            letterSpacing: 1,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          fontWeight={600}
          sx={{
            mt: 0.5,
            color: valueColor || "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 1,
            wordBreak: "break-word",
          }}
        >
          {status && (
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#34d399",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
          )}

          {value}
        </Typography>
      </Box>
    </Paper>
  );
}
export default DetailCard;