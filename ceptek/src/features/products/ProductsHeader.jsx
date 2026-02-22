import * as React from "react";
import {
  Paper,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";

export function ProductsHeader({
  searchText,
  setSearchText,
  warehouseId,
  setWarehouseId,
  typeId,
  setTypeId,
  warehouses,
  productTypes,
  selectedIds,
  setOpenDeleteSelectedDialog,
  handleAddClick,
}) {
  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Stack
        spacing={1}
        sx={{
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, flex: 1, fontWeight: "bold" }}>
          Inventory Management
        </Typography>
        <Button
          color="error"
          variant="contained"
          disabled={selectedIds.size === 0}
          onClick={() => setOpenDeleteSelectedDialog(true)}
        >
          Delete Selected ({selectedIds.size})
        </Button>

        <Button variant="contained" onClick={handleAddClick}>
          Add Product
        </Button>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search product..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Warehouse</InputLabel>
          <Select
            value={warehouseId}
            label="Warehouse"
            onChange={(e) => setWarehouseId(e.target.value)}
          >
            <MenuItem value="">All Warehouses</MenuItem>
            {warehouses.map((w) => (
              <MenuItem key={w.id} value={w.id}>
                {w.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeId}
            label="Type"
            onChange={(e) => setTypeId(e.target.value)}
          >
            <MenuItem value="">All Types</MenuItem>
            {productTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {(warehouseId || typeId || searchText) && (
          <Button
            color="inherit"
            onClick={() => {
              setWarehouseId("");
              setTypeId("");
              setSearchText("");
            }}
          >
            Reset
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
