import { useState } from "react";
import {
  Box,
  Typography,
  Alert,
  TextField,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

import {
  useStockTransactionLogQuery,
  useStockTransactionLogFilterData,
} from "./stockTransactionLog.hooks";
import { stockTransactionLogColumns } from "./stockTransactionLog.columns";
import StockTransactionLogDetailsDrawer from "./StockTransactionLogDetailsDrawer";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { useMessageDialog } from "../../hooks/useMessageDialog";

export function StockTransactionLogList() {
  const { t } = useTranslation();
  const { messageDialog, closeMessageDialog } = useMessageDialog();

  const [movementTypeId, setMovementTypeId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);

  const { movementTypes, warehouses } = useStockTransactionLogFilterData();

  const {
    rows,
    rowCount,
    isLoading,
    isFetching,
    isError,
    error,
    paginationModel,
    setPaginationModel,
    searchText,
    setSearchText,
  } = useStockTransactionLogQuery({
    movementTypeId: movementTypeId || undefined,
    warehouseId: warehouseId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const handlePaginationChange = (newModel) => {
    setPaginationModel(newModel);
  };

  const handleClearFilters = () => {
    setMovementTypeId("");
    setWarehouseId("");
    setDateFrom("");
    setDateTo("");
    setSearchText("");
  };

  const hasActiveFilters =
    movementTypeId || warehouseId || dateFrom || dateTo || searchText;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header — read-only, no Add button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight="bold">
          {t("stockTransactionLogFeature.title")}
        </Typography>
      </Box>

      {/* Filter Bar */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
          flexWrap="wrap"
        >
          {/* Text Search */}
          <TextField
            label={t("common.search")}
            variant="outlined"
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ minWidth: 200, flex: 1 }}
          />

          {/* Movement Type Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>
              {t("stockTransactionLogFeature.movementType")}
            </InputLabel>
            <Select
              value={movementTypeId}
              label={t("stockTransactionLogFeature.movementType")}
              onChange={(e) => setMovementTypeId(e.target.value)}
            >
              <MenuItem value="">
                <em>{t("stockTransactionLogFeature.allTypes")}</em>
              </MenuItem>
              {movementTypes.map((mt) => (
                <MenuItem key={mt.id} value={mt.id}>
                  {mt.movement_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Warehouse Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t("stockTransactionLogFeature.warehouse")}</InputLabel>
            <Select
              value={warehouseId}
              label={t("stockTransactionLogFeature.warehouse")}
              onChange={(e) => setWarehouseId(e.target.value)}
            >
              <MenuItem value="">
                <em>{t("stockTransactionLogFeature.allWarehouses")}</em>
              </MenuItem>
              {warehouses.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date From */}
          <TextField
            label={t("stockTransactionLogFeature.dateFrom")}
            type="date"
            size="small"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 160 }}
          />

          {/* Date To */}
          <TextField
            label={t("stockTransactionLogFeature.dateTo")}
            type="date"
            size="small"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 160 }}
          />

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<FilterAltOffIcon />}
              onClick={handleClearFilters}
              sx={{ whiteSpace: "nowrap" }}
            >
              {t("stockTransactionLogFeature.clearFilters")}
            </Button>
          )}
        </Stack>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("common.failedToLoad", {
            error: error?.message || t("common.unknownError"),
          })}
        </Alert>
      )}

      <Paper sx={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={rows}
          rowCount={rowCount}
          columns={stockTransactionLogColumns(t, (row) =>
            setSelectedEntry(row),
          )}
          loading={isLoading || isFetching}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          onRowClick={(params) => setSelectedEntry(params.row)}
          sx={{ width: "100%", "& .MuiDataGrid-row": { cursor: "pointer" } }}
        />
      </Paper>

      {/* Details Drawer */}
      <StockTransactionLogDetailsDrawer
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />

      <MessageDialog
        open={messageDialog.open}
        title={messageDialog.title}
        message={messageDialog.message}
        severity={messageDialog.severity}
        onClose={closeMessageDialog}
      />

      <ScrollToTopButton />
    </Box>
  );
}
