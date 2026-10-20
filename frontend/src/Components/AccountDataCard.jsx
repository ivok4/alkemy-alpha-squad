import {
  Box,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  ContentCopy,
} from "@mui/icons-material";

function AccountDataCard({ title, value, copied, onCopy }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: "#020617",
        borderColor: "rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box
        sx={{
          minWidth: 0,
        }}
      >
        <Typography variant="caption" color="#38bdf8">
          {title}
        </Typography>

        <Typography
          variant="body1"
          fontWeight={700}
          sx={{
            fontFamily: "monospace",
            color: "#38bdf8",
            letterSpacing: 0.5,
            mt: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </Typography>
      </Box>

      <IconButton
        onClick={onCopy}
        aria-label={`Copiar ${title}`}
        sx={{
          bgcolor: "rgba(255,255,255,0.05)",
          borderRadius: 2,
          flexShrink: 0,
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.1)",
          },
        }}
      >
        {copied ? (
          <CheckCircle
            sx={{
              color: "#38bdf8",
            }}
          />
        ) : (
          <ContentCopy />
        )}
      </IconButton>
    </Paper>
  );
}
export default AccountDataCard;