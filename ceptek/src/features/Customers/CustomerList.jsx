import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  TextField,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useCustomerQuery, useCustomerMutations } from "./customer.hooks";
import { getCustomerTypes } from "../customerTypes/customerType.api";
import { customerColumns } from "./customer.columns";
import CustomerForm from "./CustomerForm";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { useMessageDialog } from "../../hooks/useMessageDialog";

export function CustomerList() {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDeleteSelected, setOpenDeleteSelected] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [mode, setMode] = useState("add");
  const [customerTypeId, setCustomerTypeId] = useState("");

  function handleCloseForm() {
    setOpenForm(false);
    setSelectedItem(null);
  }

  const { messageDialog, showMessageDialog, closeMessageDialog } =
    useMessageDialog();

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
  } = useCustomerQuery({ customerTypeId: customerTypeId || undefined });

  const { data: typesData } = useQuery({
    queryKey: ["customerTypesSelect"],
    queryFn: () => getCustomerTypes({ page: 0, pageSize: 100 }),
  });

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    deleteMultipleMutation,
  } = useCustomerMutations({
    onSuccess: handleCloseForm,
    showMessageDialog,
  });

  const handleOpenAdd = () => {
    setMode("add");
    setSelectedItem(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (row) => {
    setMode("edit");
    setSelectedItem(row);
    setOpenForm(true);
  };

  const handleFormSubmit = (data) => {
    if (mode === "add") {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate({ id: selectedItem.id, data });
    }
  };

  const handleDeleteClick = (row) => {
    setSelectedItem(row);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedItem) return;
    deleteMutation.mutate(selectedItem.id, {
      onSettled: () => {
        setOpenDelete(false);
        setSelectedItem(null);
      },
    });
  };

  const handlePaginationChange = (newModel) => {
    setSelectedIds(new Set());
    setPaginationModel(newModel);
  };

  const toggleSelectAll = () => {
    const allSelected =
      rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleDeleteSelectedConfirm = () => {
    if (selectedIds.size === 0) return;
    deleteMultipleMutation.mutate(Array.from(selectedIds), {
      onSettled: () => {
        setOpenDeleteSelected(false);
        setSelectedIds(new Set());
      },
    });
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">{t("customersFeature.title")}</Typography>
        <Box display="flex" gap={1}>
          {selectedIds.size > 0 && (
            <Button
              variant="contained"
              color="error"
              onClick={() => setOpenDeleteSelected(true)}
            >
              {t("common.deleteSelected")} ({selectedIds.size})
            </Button>
          )}
          <Button variant="contained" onClick={handleOpenAdd}>
            {t("common.addNew")}
          </Button>
        </Box>
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <TextField
          label={t("common.search")}
          variant="outlined"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          fullWidth
          sx={{ maxWidth: 400 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={customerTypeId}
            label="Type"
            onChange={(e) => setCustomerTypeId(e.target.value)}
          >
            <MenuItem value="">All Types</MenuItem>
            {typesData?.data?.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.type_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("common.failedToLoad")}: {error?.message || t("common.unknownError")}
        </Alert>
      )}

      <Paper sx={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={rows}
          rowCount={rowCount}
          columns={customerColumns(
            handleOpenEdit,
            handleDeleteClick,
            selectedIds,
            toggleSelect,
            rows,
            toggleSelectAll,
            t,
          )}
          loading={isLoading || isFetching}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{ width: "100%" }}
        />
      </Paper>

      <CustomerForm
        open={openForm}
        mode={mode}
        initialData={selectedItem}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        customerTypes={typesData?.data || []}
      />

      <ConfirmDeleteDialog
        open={openDelete}
        itemName={selectedItem?.name || ""}
        onClose={() => {
          setOpenDelete(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />

      <ConfirmDeleteDialog
        open={openDeleteSelected}
        itemName={`${selectedIds.size} ${t("common.selectedItems")}`}
        onClose={() => setOpenDeleteSelected(false)}
        onConfirm={handleDeleteSelectedConfirm}
        isPending={deleteMultipleMutation.isPending}
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
