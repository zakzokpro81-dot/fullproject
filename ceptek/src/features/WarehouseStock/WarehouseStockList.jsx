import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Autocomplete,
  Paper,
  Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";

import { getWarehouseStock, getWarehouses, getBrands } from "./warehouseStock.api";
import { stockColumns } from "./warehouseStock.columns";
import ProductActionDialogs from "../../componenets/ProductActionDialogs";

export function WarehouseStockList() {
  const [searchText, setSearchText] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: stock = [], isLoading } = useQuery({
    queryKey: ["warehouse_stock"],
    queryFn: getWarehouseStock,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  const filteredRows = useMemo(() => {
    return stock.filter((row) => {
      const matchesSearch =
        row?.products?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        row?.products?.sku?.toLowerCase().includes(searchText.toLowerCase());

      const matchesWarehouse = selectedWarehouse
        ? row?.warehouses?.id === selectedWarehouse.id
        : true;

      const matchesBrand = selectedBrand
        ? row?.products?.brands?.id === selectedBrand.id
        : true;

      return matchesSearch && matchesWarehouse && matchesBrand;
    });
  }, [stock, searchText, selectedWarehouse, selectedBrand]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRows.map((r) => r.id));
    }
  };

  const handleDelete = (row) => {
    setDeleteTarget(row);
  };

  const columns = stockColumns(
    handleDelete,
    selectedIds,
    toggleSelect,
    filteredRows,
    toggleSelectAll
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>
        Stock Management
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Search"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Autocomplete
            options={warehouses}
            getOptionLabel={(option) => option.name || ""}
            value={selectedWarehouse}
            onChange={(e, value) => setSelectedWarehouse(value)}
            renderInput={(params) => (
              <TextField {...params} label="Warehouse" />
            )}
            sx={{ minWidth: 200 }}
          />

          <Autocomplete
            options={brands}
            getOptionLabel={(option) => option.name || ""}
            value={selectedBrand}
            onChange={(e, value) => setSelectedBrand(value)}
            renderInput={(params) => <TextField {...params} label="Brand" />}
            sx={{ minWidth: 200 }}
          />

          <Button variant="contained">
            Add Stock Movement
          </Button>
        </Stack>
      </Paper>

      {/* DataGrid */}
      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: { quickFilterAlwaysVisible: true },
          }}
          sx={{ width: "100%" }}
        />
      </Paper>

      {/* Delete Dialog */}
      <ProductActionDialogs
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Stock Item"
        description={`Are you sure you want to delete stock for: ${
          deleteTarget?.products?.name || ""
        }`}
        onConfirm={() => {
          // لاحقاً نربطها بـ mutation
          setDeleteTarget(null);
        }}
      />
    </Box>
  );
}
