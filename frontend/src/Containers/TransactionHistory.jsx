import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TransactionFiltersBar from "../Components/TransactionFiltersBar";

function TransactionHistory({
  limit = null,
  showFilters = true,
  title = "Mis Movimientos",
}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "all",
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const params = new URLSearchParams({
          pagina: pagina,
          porPagina: 10,
        });

        if (filters.fechaDesde) params.append("fechaDesde", filters.fechaDesde);
        if (filters.fechaHasta) params.append("fechaHasta", filters.fechaHasta);
        if (filters.type && filters.type !== "all")
          params.append("tipo", filters.type);

        const response = await fetch(
          `http://localhost:5016/api/Transactions?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("No se pudieron cargar las transacciones");
        }

        const data = await response.json();

        const txs = limit
          ? data.transacciones.slice(0, limit)
          : data.transacciones;
        setTransactions(txs);
        setTotalPaginas(data.totalPaginas);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [pagina, filters.fechaDesde, filters.fechaHasta, filters.type, limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPagina(1);
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 4,
        }}
      >
        <CircularProgress size={28} sx={{ color: "#38bdf8" }} />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ color: "#ef4444" }}>Error: {error}</Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: limit ? "auto" : "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        animation: limit ? "none" : "fadeInUp 0.6s ease both",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          px: limit ? 2.5 : 0,
          pt: limit ? 2 : 0,
          pb: limit ? 1 : 2,
        }}
      >
        <Typography
          component="h2"
          variant={limit ? "subtitle1" : "h4"}
          sx={{
            fontWeight: 700,
            color: "#f3f4f6",
          }}
        >
          {title}
        </Typography>
        {limit && (
          <Button
            component={Link}
            to="/transactionHistory"
            size="small"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#38bdf8",
              "&:hover": { bgcolor: "rgba(56, 189, 248, 0.08)" },
            }}
          >
            Ver todos →
          </Button>
        )}
      </Box>

      {/* Filters */}
      {showFilters && !limit && (
        <Box sx={{ width: "100%", maxWidth: 800, mb: 3 }}>
          <TransactionFiltersBar
            handleChange={handleFilterChange}
            filters={filters}
            handleFilterChange={handleFilterChange}
          />
        </Box>
      )}

      {/* Empty state */}
      {transactions.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: limit ? 3 : 8,
            px: 3,
          }}
        >
          <Typography
            variant={limit ? "body2" : "h6"}
            sx={{ color: "#9ca3af", fontWeight: 500 }}
          >
            No tienes transferencias registradas.
          </Typography>
          {!limit && (
            <Button
              component={Link}
              to="/dashboard"
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Hacé un depósito
            </Button>
          )}
        </Box>
      ) : (
        <>
          {/* Transaction list */}
          <Box
            sx={{
              width: "100%",
              maxWidth: limit ? "100%" : 800,
              display: "flex",
              flexDirection: "column",
              gap: limit ? 0 : 1.5,
              px: limit ? 0 : 0,
            }}
          >
            {transactions.map((tx, index) => {
              const isCredit = tx.tipo === "Crédito";
              const formattedDate = new Date(tx.date).toLocaleString();

              return (
                <Box
                  key={tx.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: limit ? 2.5 : 2,
                    py: 1.5,
                    borderRadius: limit ? 0 : "12px",
                    bgcolor: limit
                      ? "transparent"
                      : "rgba(255, 255, 255, 0.02)",
                    border: limit
                      ? "none"
                      : "1px solid rgba(255, 255, 255, 0.06)",
                    borderBottom: limit
                      ? "1px solid rgba(255, 255, 255, 0.04)"
                      : undefined,
                    backdropFilter: limit ? "none" : "blur(12px)",
                    transition: "all 0.2s ease",
                    animation: limit
                      ? "none"
                      : `fadeInUp 0.4s ease ${index * 0.05}s both`,
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.04)",
                    },
                    "&:last-child": {
                      borderBottom: "none",
                    },
                  }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isCredit
                        ? "rgba(16, 185, 129, 0.12)"
                        : "rgba(239, 68, 68, 0.12)",
                      color: isCredit ? "#10b981" : "#ef4444",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      flexShrink: 0,
                    }}
                  >
                    {isCredit ? "↓" : "↑"}
                  </Box>

                  {/* Details */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#f3f4f6",
                        fontSize: "0.9rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tx.description || tx.tipo}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#9ca3af" }}
                    >
                      {formattedDate}
                    </Typography>
                  </Box>

                  {/* Amount */}
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: isCredit ? "#10b981" : "#ef4444",
                      whiteSpace: "nowrap",
                      fontSize: "0.95rem",
                    }}
                  >
                    {isCredit
                      ? `+$${tx.amount.toFixed(2)}`
                      : `-$${tx.amount.toFixed(2)}`}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Pagination */}
          {!limit && (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 4,
                mb: 4,
                alignItems: "center",
              }}
            >
              <Button
                variant="outlined"
                disabled={pagina === 1}
                onClick={() => setPagina((prev) => prev - 1)}
                sx={{
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "#f3f4f6",
                  "&:hover": {
                    borderColor: "#38bdf8",
                    bgcolor: "rgba(56, 189, 248, 0.08)",
                  },
                }}
              >
                Anterior
              </Button>
              <Typography sx={{ color: "#9ca3af", fontSize: "0.9rem" }}>
                Página {pagina} de {totalPaginas || 1}
              </Typography>
              <Button
                variant="outlined"
                disabled={pagina >= totalPaginas}
                onClick={() => setPagina((prev) => prev + 1)}
                sx={{
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "#f3f4f6",
                  "&:hover": {
                    borderColor: "#38bdf8",
                    bgcolor: "rgba(56, 189, 248, 0.08)",
                  },
                }}
              >
                Siguiente
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default TransactionHistory;
