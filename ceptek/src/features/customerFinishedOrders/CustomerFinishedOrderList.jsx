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
  useCustomerFinishedOrderQuery,
  useFinishedOrderFilterData,
} from "./customerFinishedOrder.hooks";
import { customerFinishedOrderColumns } from "./customerFinishedOrder.columns";
import FinishedOrderDetailsDrawer from "./FinishedOrderDetailsDrawer";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { useMessageDialog } from "../../hooks/useMessageDialog";

export function CustomerFinishedOrderList() {
  const { t } = useTranslation();
  const { messageDialog, closeMessageDialog } = useMessageDialog();

  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { customers, warehouses } = useFinishedOrderFilterData();

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
  } = useCustomerFinishedOrderQuery({
    customerId: customerId || undefined,
    warehouseId: warehouseId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const handlePaginationChange = (newModel) => {
    setPaginationModel(newModel);
  };

  const handleClearFilters = () => {
    setCustomerId("");
    setWarehouseId("");
    setDateFrom("");
    setDateTo("");
    setSearchText("");
  };

  const hasActiveFilters = customerId || warehouseId || dateFrom || dateTo || searchText;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight="bold">
          {t("finishedOrdersFeature.title")}
        </Typography>
      </Box>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
          flexWrap="wrap"
        >
          {/* Search */}
          <TextField
            label={t("common.search")}
            variant="outlined"
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ minWidth: 200, flex: 1 }}
          />

          {/* Customer Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t("finishedOrdersFeature.customer")}</InputLabel>
            <Select
              value={customerId}
              label={t("finishedOrdersFeature.customer")}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <MenuItem value="">
                <em>{t("finishedOrdersFeature.allCustomers")}</em>
              </MenuItem>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Warehouse Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t("finishedOrdersFeature.warehouse")}</InputLabel>
            <Select
              value={warehouseId}
              label={t("finishedOrdersFeature.warehouse")}
              onChange={(e) => setWarehouseId(e.target.value)}
            >
              <MenuItem value="">
                <em>{t("finishedOrdersFeature.allWarehouses")}</em>
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
            label={t("finishedOrdersFeature.dateFrom")}
            type="date"
            size="small"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 160 }}
          />

          {/* Date To */}
          <TextField
            label={t("finishedOrdersFeature.dateTo")}
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
              {t("finishedOrdersFeature.clearFilters")}
            </Button>
          )}
        </Stack>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("common.failedToLoad")}:{" "}
          {error?.message || t("common.unknownError")}
        </Alert>
      )}

      <Paper sx={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={rows}
          rowCount={rowCount}
          columns={customerFinishedOrderColumns(t, (row) =>
            setSelectedOrder(row),
          )}
          loading={isLoading || isFetching}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          onRowClick={(params) => setSelectedOrder(params.row)}
          sx={{
            width: "100%",
            "& .MuiDataGrid-row": { cursor: "pointer" },
          }}
        />
      </Paper>

      {/* Details Drawer */}
      <FinishedOrderDetailsDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
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
