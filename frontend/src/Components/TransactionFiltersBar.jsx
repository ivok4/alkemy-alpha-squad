import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Stack,
} from "@mui/material";

function TransactionFiltersBar({ handleChange, filters, handleFilterChange }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ width: "100%" }}
    >
      <FormControl
        sx={{
          flex: 1,
          "& .MuiOutlinedInput-root": {
            bgcolor: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(8px)",
            "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
            "&:hover fieldset": { borderColor: "rgba(56, 189, 248, 0.3)" },
          },
          "& .MuiInputLabel-root": { color: "#9ca3af" },
          "& .MuiSelect-select": { color: "#f3f4f6" },
        }}
      >
        <InputLabel id="filter-type-label">Tipo de movimiento</InputLabel>
        <Select
          name="type"
          labelId="filter-type-label"
          id="filter-type"
          value={filters.type}
          label="Tipo de movimiento"
          onChange={(e) => handleChange(e)}
        >
          <MenuItem value={"all"}>Todas</MenuItem>
          <MenuItem value={"sent"}>Depósito</MenuItem>
          <MenuItem value={"recived"}>Transferencia</MenuItem>
        </Select>
      </FormControl>

      <TextField
        type="date"
        name="fechaDesde"
        label="Desde"
        value={filters.fechaDesde || ""}
        onChange={handleFilterChange}
        slotProps={{
          inputLabel: { shrink: true },
        }}
        sx={{ flex: 1 }}
      />

      <TextField
        type="date"
        name="fechaHasta"
        label="Hasta"
        value={filters.fechaHasta || ""}
        onChange={handleFilterChange}
        slotProps={{
          inputLabel: { shrink: true },
        }}
        sx={{ flex: 1 }}
      />
    </Stack>
  );
}

export default TransactionFiltersBar;
