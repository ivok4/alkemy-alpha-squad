import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Paper,
  Switch,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  AcUnit,
  AddCard,
} from "@mui/icons-material";

import { virtualCardService } from "../services/cardService";

export default function VirtualCard() {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showData, setShowData] = useState(false);

  useEffect(() => {
    fetchCard();
  }, []);

  const fetchCard = async () => {
    try {
      const data = await virtualCardService.getMyCard();
      setCard(data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error obteniendo tarjeta", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);

    try {
      const newCard = await virtualCardService.createCard();
      setCard(newCard);
    } catch (error) {
      console.error("Error creando tarjeta", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFreeze = async () => {
    try {
      const result = await virtualCardService.toggleFreezeCard();

      setCard((prevCard) => ({
        ...prevCard,
        isFrozen: result.isFrozen,
      }));
    } catch (error) {
      console.error("Error cambiando estado de la tarjeta", error);
    }
  };

  const formatCardNumber = (number, show) => {
    if (!number) return "";

    if (show) {
      return number.match(/.{1,4}/g)?.join(" ") || number;
    }

    return `**** **** **** ${number.slice(-4)}`;
  };

  const formatCVV = (cvv, show) => {
    if (!cvv) return "***";

    return show ? cvv : "***";
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!card) {
    return (
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 500,
            p: 5,
            borderRadius: 4,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <AddCard
            sx={{
              fontSize: 56,
              mb: 2,
              color: "primary.main",
            }}
          />

          <Typography variant="h6" fontWeight={700} gutterBottom>
            No tienes una tarjeta virtual
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Genera tu tarjeta virtual para comenzar a utilizarla.
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddCard />}
            onClick={handleCreate}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              px: 4,
              py: 1.2,
              fontWeight: 700,
            }}
          >
            Generar Tarjeta
          </Button>
        </Paper>
      </Box>
    );
  }

  if (card.isFrozen)
    return (
      <Box sx={{       width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,}}>
        <Paper
          elevation={8}
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 480,
            minHeight: 270,
            p: 3.5,
            borderRadius: 4,
            overflow: "hidden",
            color: "white",

            background: card.isFrozen
              ? "linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)"
              : "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)",

            filter: card.isFrozen ? "saturate(0.65)" : "none",

            opacity: card.isFrozen ? 0.82 : 1,

            border: "1px solid",
            borderColor: card.isFrozen
              ? "rgba(148, 163, 184, 0.25)"
              : "rgba(255,255,255,0.08)",

            transition: "all 0.3s ease",
          }}
        >
          {card.isFrozen && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "linear-gradient(135deg, rgba(148,163,184,0.12), rgba(56,189,248,0.05))",
              }}
            />
          )}

          <Box
            sx={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: "50%",
              top: -80,
              right: -50,

              bgcolor: card.isFrozen
                ? "rgba(148, 163, 184, 0.10)"
                : "rgba(56, 189, 248, 0.08)",

              transition: "all 0.3s ease",
            }}
          />

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6" fontWeight={700} letterSpacing={1}>
                WalletCard
              </Typography>

              <IconButton
                onClick={() => setShowData((prev) => !prev)}
                sx={{
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.08)",

                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.15)",
                  },
                }}
              >
                {showData ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Box>
            <Box sx={{ mt: 5 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  mb: 1,
                }}
              >
                NÚMERO DE TARJETA
              </Typography>

              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: {
                    xs: "1.15rem",
                    sm: "1.35rem",
                  },
                  letterSpacing: 2,
                  fontWeight: 600,
                }}
              >
                {formatCardNumber(card.cardNumber, showData)}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 5,
                mt: 4,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "rgba(255,255,255,0.6)",
                    mb: 0.5,
                  }}
                >
                  VENCIMIENTO
                </Typography>

                <Typography fontWeight={600} fontFamily="monospace">
                  {showData ? card.expirationDate : "**/**"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "rgba(255,255,255,0.6)",
                    mb: 0.5,
                  }}
                >
                  CVV
                </Typography>

                <Typography fontWeight={600} fontFamily="monospace">
                  {formatCVV(card.cvv, showData)}
                </Typography>
              </Box>
            </Box>
            {card.isFrozen && (
              <Box
                sx={{
                  position: "absolute",
                  top: 75,
                  right: 24,

                  display: "flex",
                  alignItems: "center",
                  gap: 0.7,

                  px: 1.5,
                  py: 0.7,

                  borderRadius: 2,

                  bgcolor: "rgba(148, 163, 184, 0.16)",
                  border: "1px solid rgba(148, 163, 184, 0.25)",

                  color: "#cbd5e1",

                  backdropFilter: "blur(6px)",
                }}
              >
                <AcUnit
                  sx={{
                    fontSize: 18,
                  }}
                />

                <Typography
                  variant="caption"
                  fontWeight={700}
                  letterSpacing={0.5}
                >
                  CONGELADA
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 480,
            p: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(card.isFrozen)}
                onChange={handleToggleFreeze}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Congelar Tarjeta
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Pausa temporalmente las compras y débitos
                </Typography>
              </Box>
            }
          />
        </Paper>
      </Box>
    );

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          minHeight: 270,
          p: 3.5,
          borderRadius: 4,
          overflow: "hidden",
          color: "white",
          background:
            "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            bgcolor: "rgba(56, 189, 248, 0.08)",
            top: -80,
            right: -50,
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" fontWeight={700} letterSpacing={1}>
              WalletCard
            </Typography>

            <IconButton
              onClick={() => setShowData((prev) => !prev)}
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.08)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
              aria-label={
                showData
                  ? "Ocultar datos de la tarjeta"
                  : "Mostrar datos de la tarjeta"
              }
            >
              {showData ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </Box>

          <Box sx={{ mt: 5 }}>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.6)",
                mb: 1,
              }}
            >
              NÚMERO DE TARJETA
            </Typography>

            <Typography
              sx={{
                fontFamily: "monospace",
                fontSize: {
                  xs: "1.15rem",
                  sm: "1.35rem",
                },
                letterSpacing: 2,
                fontWeight: 600,
              }}
            >
              {formatCardNumber(card.cardNumber, showData)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 5,
              mt: 4,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "rgba(255,255,255,0.6)",
                  mb: 0.5,
                }}
              >
                VENCIMIENTO
              </Typography>

              <Typography fontWeight={600} fontFamily="monospace">
                {showData ? card.expirationDate : "**/**"}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "rgba(255,255,255,0.6)",
                  mb: 0.5,
                }}
              >
                CVV
              </Typography>

              <Typography fontWeight={600} fontFamily="monospace">
                {formatCVV(card.cvv, showData)}
              </Typography>
            </Box>
          </Box>

          {card.isFrozen && (
            <Box
              sx={{
                position: "absolute",
                top: 75,
                right: 24,
                display: "flex",
                alignItems: "center",
                gap: 0.7,
                px: 1.5,
                py: 0.7,
                borderRadius: 2,
                bgcolor: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
              }}
            >
              <AcUnit sx={{ fontSize: 18 }} />

              <Typography variant="caption" fontWeight={700}>
                CONGELADA
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 480,
          p: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(card.isFrozen)}
              onChange={handleToggleFreeze}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Congelar Tarjeta
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Pausa temporalmente las compras y débitos
              </Typography>
            </Box>
          }
        />
      </Paper>
    </Box>
  );
}
