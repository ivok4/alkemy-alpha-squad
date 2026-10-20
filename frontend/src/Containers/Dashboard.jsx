import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
  Chip,
  Divider,
  Button,
  Collapse,
} from "@mui/material";
import {
  AccountBalanceWallet,
  Visibility,
  VisibilityOff,
  ArrowDownward,
  Send,
  ContentCopy,
  Check,
} from "@mui/icons-material";
import DepositForm from "../Components/DepositForm";
import TransferForm from "../Components/TransferForm";
import accountService from "../services/accountService";
import TransactionHistory from "./TransactionHistory";
import VirtualCard from "../Components/VirtualCard";

function Dashboard() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBalance, setShowBalance] = useState(true);
  const [activeAction, setActiveAction] = useState(null); // 'deposit' | 'transfer' | null
  const [historyKey, setHistoryKey] = useState(0);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await accountService.getBalance();
        setAccount(data);
        setError("");
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Sesión expirada. Vuelva a iniciar sesión.");
        } else {
          setError("No se pudo obtener el saldo de la cuenta.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  const toggleShowBalance = () => {
    setShowBalance((prev) => !prev);
  };

  const handleOperationSuccess = (newBalance) => {
    setAccount((prev) => (prev ? { ...prev, balance: newBalance } : prev));
    setHistoryKey((prev) => prev + 1);
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress sx={{ color: "#38bdf8" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "80vh",
        animation: "fadeInUp 0.6s ease both",
      }}
    >
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/auth";
              }}
            >
              Iniciar Sesión
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {account && (
        <Box
          direction={{ xs: "column", md: "row" }}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            width: "100%",
          }}
        >
          <Box sx={{    width: {
                xs: "100%",
                sm: "100%",
                md: "48%%",
                lg: "48%",
              }, }}>
            {/* ═══════════ BALANCE HERO CARD ═══════════ */}
            <Card
              elevation={0}
              sx={{
                overflow: "hidden",
                background:
                  "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 26, 0.98) 100%)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                boxShadow:
                  "0 16px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(56, 189, 248, 0.08)",
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", md: "center" }}
                  spacing={3}
                >
                  {/* Left: Balance info */}
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1.5 }}
                    >
                      <Box
                        sx={{
                          display: "inline-flex",
                          p: 1,
                          borderRadius: "12px",
                          bgcolor: "rgba(56, 189, 248, 0.15)",
                        }}
                      >
                        <AccountBalanceWallet
                          sx={{ fontSize: 24, color: "#38bdf8" }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "#9ca3af", fontWeight: 600 }}
                      >
                        Saldo disponible
                      </Typography>
                      <Chip
                        label="Cuenta Activa"
                        size="small"
                        sx={{
                          bgcolor: "rgba(16, 185, 129, 0.15)",
                          color: "#10b981",
                          fontWeight: 600,
                          fontSize: "0.72rem",
                          height: 22,
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                        }}
                      />
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          color: "#ffffff",
                          letterSpacing: "-0.02em",
                          fontSize: { xs: "2rem", sm: "2.6rem" },
                        }}
                      >
                        {showBalance
                          ? `$ ${account.balance.toLocaleString("es-AR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "$ ••••••"}
                      </Typography>
                      <IconButton
                        onClick={toggleShowBalance}
                        size="small"
                        sx={{
                          color: "#9ca3af",
                          bgcolor: "rgba(255,255,255,0.05)",
                          "&:hover": {
                            color: "#38bdf8",
                            bgcolor: "rgba(56,189,248,0.15)",
                          },
                        }}
                        aria-label="Ocultar o mostrar saldo"
                      >
                        {showBalance ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </Stack>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "#9ca3af",
                        mt: 0.8,
                        display: "block",
                        fontWeight: 500,
                      }}
                    >
                      Moneda: {account.currency || "ARS"}
                    </Typography>
                  </Box>

                  {/* Right: Account details */}
                  <Box
                    sx={{
                      bgcolor: "rgba(3, 7, 18, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "14px",
                      p: { xs: 2, sm: 2.5 },
                      width: "100%",
                      maxWidth: { md: 360 },
                    }}
                  >
                    {/* Alias */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1.5 }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#9ca3af",
                            fontWeight: 700,
                            fontSize: "0.68rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          Alias
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#38bdf8",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                          }}
                        >
                          {account.alias}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(account.alias, "alias")}
                        sx={{
                          color:
                            copiedField === "alias" ? "#10b981" : "#9ca3af",
                          bgcolor: "rgba(255,255,255,0.04)",
                          "&:hover": { bgcolor: "rgba(56,189,248,0.12)" },
                        }}
                      >
                        {copiedField === "alias" ? (
                          <Check fontSize="small" />
                        ) : (
                          <ContentCopy fontSize="small" />
                        )}
                      </IconButton>
                    </Stack>

                    <Divider
                      sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5 }}
                    />

                    {/* CVU */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#9ca3af",
                            fontWeight: 700,
                            fontSize: "0.68rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          CVU
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#f3f4f6",
                            fontWeight: 600,
                            letterSpacing: "-0.02em",
                            fontSize: {
                              xs: "0.72rem",
                              sm: "0.82rem",
                              md: "0.85rem",
                            },
                            wordBreak: "break-all",
                          }}
                        >
                          {account.cvu}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(account.cvu, "cvu")}
                        sx={{
                          color: copiedField === "cvu" ? "#10b981" : "#9ca3af",
                          bgcolor: "rgba(255,255,255,0.04)",
                          "&:hover": { bgcolor: "rgba(56,189,248,0.12)" },
                        }}
                      >
                        {copiedField === "cvu" ? (
                          <Check fontSize="small" />
                        ) : (
                          <ContentCopy fontSize="small" />
                        )}
                      </IconButton>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* ═══════════ QUICK ACTIONS ═══════════ */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {/* Deposit Button */}
              <Card
                elevation={0}
                onClick={() =>
                  setActiveAction(activeAction === "deposit" ? null : "deposit")
                }
                sx={{
                  flex: 1,
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  border:
                    activeAction === "deposit"
                      ? "1px solid rgba(56, 189, 248, 0.6)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                  bgcolor:
                    activeAction === "deposit"
                      ? "rgba(15, 23, 42, 0.95)"
                      : "rgba(13, 17, 24, 0.9)",
                  boxShadow:
                    activeAction === "deposit"
                      ? "0 0 24px rgba(56, 189, 248, 0.2)"
                      : "none",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: "rgba(56, 189, 248, 0.4)",
                    bgcolor: "rgba(18, 24, 35, 0.95)",
                    boxShadow:
                      "0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(56, 189, 248, 0.12)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: "20px !important",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 48,
                      height: 48,
                      borderRadius: "14px",
                      bgcolor: "rgba(56, 189, 248, 0.15)",
                      transition: "all 0.3s",
                    }}
                  >
                    <ArrowDownward sx={{ color: "#38bdf8", fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: "#f3f4f6" }}
                    >
                      Depositar
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                      Ingresá dinero a tu cuenta
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Transfer Button */}
              <Card
                elevation={0}
                onClick={() =>
                  setActiveAction(
                    activeAction === "transfer" ? null : "transfer",
                  )
                }
                sx={{
                  flex: 1,
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  border:
                    activeAction === "transfer"
                      ? "1px solid rgba(56, 189, 248, 0.6)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                  bgcolor:
                    activeAction === "transfer"
                      ? "rgba(15, 23, 42, 0.95)"
                      : "rgba(13, 17, 24, 0.9)",
                  boxShadow:
                    activeAction === "transfer"
                      ? "0 0 24px rgba(56, 189, 248, 0.2)"
                      : "none",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: "rgba(56, 189, 248, 0.4)",
                    bgcolor: "rgba(18, 24, 35, 0.95)",
                    boxShadow:
                      "0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(56, 189, 248, 0.12)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: "20px !important",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 48,
                      height: 48,
                      borderRadius: "14px",
                      bgcolor: "rgba(56, 189, 248, 0.15)",
                      transition: "all 0.3s",
                    }}
                  >
                    <Send sx={{ color: "#38bdf8", fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: "#f3f4f6" }}
                    >
                      Transferir
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                      Enviá dinero a otra cuenta
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Stack>

            {/* ═══════════ DYNAMIC FORM ═══════════ */}
            <Collapse in={activeAction === "deposit"} timeout={400}>
              <DepositForm onDepositSuccess={handleOperationSuccess} />
            </Collapse>

            <Collapse in={activeAction === "transfer"} timeout={400}>
              <TransferForm
                availableBalance={account.balance}
                onTransferSuccess={handleOperationSuccess}
              />
            </Collapse>
          </Box>
          <Card
            sx={{
              bgcolor: "rgba(13, 17, 24, 0.92)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "start",
              width: {
                xs: "100%",
                sm: "100%",
                md: "48%%",
                lg: "48%",
              },
            }}
          >
            <VirtualCard />
          </Card>

          {/* ═══════════ RECENT TRANSACTIONS ═══════════ */}
          <Card
            elevation={0}
            sx={{
              overflow: "hidden",
              maxHeight: 460,
              width: "100%",
              overflowY: "auto",
              bgcolor: "rgba(13, 17, 24, 0.92)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <TransactionHistory
              key={historyKey}
              limit={5}
              title="Últimos Movimientos"
              showFilters={false}
            />
          </Card>
        </Box>
      )}
    </Box>
  );
}

export default Dashboard;
