import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  TextField,
  Paper,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import {
  useProductTypeQuery,
  useProductTypeMutations,
  useProductTypeFormOptions,
} from "./productType.hooks";
import { productTypeColumns } from "./productType.columns";
import ProductTypeForm from "./ProductTypeForm";
import { ProductTypeFilters } from "./ProductTypeFilters";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { useMessageDialog } from "../../hooks/useMessageDialog";

export function ProductTypeList() {
  // UI state
  const [selectedItem, setSelectedItem] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDeleteSelected, setOpenDeleteSelected] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [mode, setMode] = useState("add");

  function handleCloseForm() {
    setOpenForm(false);
    setSelectedItem(null);
  }

  // Data and mutations
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
    filters,
    setFilters,
  } = useProductTypeQuery();

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    deleteMultipleMutation,
  } = useProductTypeMutations({
    onSuccess: handleCloseForm,
    showMessageDialog,
  });

  const { categories, trackingTypes, variantStrategies } =
    useProductTypeFormOptions();

  // Handlers
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

  const handleDeleteSelectedClick = () => {
    setOpenDeleteSelected(true);
  };

  const handleDeleteSelectedConfirm = () => {
    deleteMultipleMutation.mutate(Array.from(selectedIds), {
      onSettled: () => {
        setOpenDeleteSelected(false);
        setSelectedIds(new Set());
      },
    });
  };

  const handlePaginationChange = (newModel) => {
    setSelectedIds(new Set());
    setPaginationModel(newModel);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (prev.size === rows.length) {
        return new Set();
      }
      return new Set(rows.map((r) => r.id));
    });
  };

  const columns = productTypeColumns(
    handleOpenEdit,
    handleDeleteClick,
    selectedIds,
    toggleSelect,
    rows,
    toggleSelectAll,
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h2">
          Product Types
        </Typography>
        <Stack direction="row" spacing={2}>
          {selectedIds.size > 0 && (
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteSelectedClick}
            >
              Delete ({selectedIds.size}) Selected
            </Button>
          )}
          <Button variant="contained" onClick={handleOpenAdd}>
            Add Product Type
          </Button>
        </Stack>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <ProductTypeFilters filters={filters} setFilters={setFilters} />
      </Stack>

      {isError && <Alert severity="error">Error: {error.message}</Alert>}

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          loading={isLoading || isFetching}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[10, 20, 50]}
          getRowId={(row) => row.id}
          checkboxSelection={false} // We use a custom checkbox column
          disableRowSelectionOnClick
        />
      </Box>

      <ProductTypeForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        mode={mode}
        initialData={selectedItem}
        isPending={createMutation.isPending || updateMutation.isPending}
        categories={categories}
        trackingTypes={trackingTypes}
        variantStrategies={variantStrategies}
      />

      <ConfirmDeleteDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedItem?.name}
        isPending={deleteMutation.isPending}
      />

      <ConfirmDeleteDialog
        open={openDeleteSelected}
        onClose={() => setOpenDeleteSelected(false)}
        onConfirm={handleDeleteSelectedConfirm}
        itemName={`${selectedIds.size} items`}
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
    </Paper>
  );
}
