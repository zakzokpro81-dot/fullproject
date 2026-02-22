import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid } from "@mui/x-data-grid";

import { useBrandQuery, useBrandMutations } from "./brand.hooks";
import { brandColumns } from "./brand.columns";
import BrandForm from "./BrandForm";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { useSnackbar } from "../../hooks/useSnackbar";

export function BrandList() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDeleteSelected, setOpenDeleteSelected] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [mode, setMode] = useState("add"); // "add" | "edit"

  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
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
  } = useBrandQuery();
  const { createMutation, updateMutation, deleteMutation, deleteMultipleMutation } = useBrandMutations({
    onSuccess: handleCloseForm,
    showSnackbar,
  });

  // ── Open / Close ──
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

  function handleCloseForm() {
    setOpenForm(false);
    setSelectedItem(null);
  }

  // ── Submit ──
  const handleFormSubmit = (data) => {
    if (mode === "add") {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate({ id: selectedItem.id, data });
    }
  };

  // ── Delete ──
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

  const handleDeleteClose = () => {
    setOpenDelete(false);
    setSelectedItem(null);
  };

  // ── Pagination (clear selection on page change) ──
  const handlePaginationChange = (newModel) => {
    setSelectedIds(new Set());
    setPaginationModel(newModel);
  };

  // ── Checkbox Selection ──
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

  // ── Bulk Delete ──
  const handleDeleteSelectedConfirm = () => {
    if (selectedIds.size === 0) return;
    deleteMultipleMutation.mutate(Array.from(selectedIds), {
      onSettled: () => {
        setOpenDeleteSelected(false);
        setSelectedIds(new Set());
      },
    });
  };

  const isFormPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Brands</Typography>
        <Box display="flex" gap={1}>
          {selectedIds.size > 0 && (
            <Button
              variant="contained"
              color="error"
              onClick={() => setOpenDeleteSelected(true)}
            >
              Delete Selected ({selectedIds.size})
            </Button>
          )}
          <Button variant="contained" onClick={handleOpenAdd}>
            Add Brand
          </Button>
        </Box>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || "Failed to load brands."}
        </Alert>
      )}

      <TextField
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search brands..."
        size="small"
        sx={{ mb: 2, width: 300 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <DataGrid
        rows={rows}
        columns={brandColumns({ onEdit: handleOpenEdit, onDelete: handleDeleteClick, selectedIds, toggleSelect, rows, toggleSelectAll })}
        loading={isLoading || isFetching}
        paginationMode="server"
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        sx={{ width: "100%", height: 600 }}
      />

      <BrandForm
        open={openForm}
        mode={mode}
        initialData={selectedItem}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        isPending={isFormPending}
      />

      <ConfirmDeleteDialog
        open={openDelete}
        itemName={selectedItem?.name}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />

      <ConfirmDeleteDialog
        open={openDeleteSelected}
        itemName={`${selectedIds.size} selected item${selectedIds.size !== 1 ? "s" : ""}`}
        onClose={() => setOpenDeleteSelected(false)}
        onConfirm={handleDeleteSelectedConfirm}
        isPending={deleteMultipleMutation.isPending}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <ScrollToTopButton />
    </Box>
  );
}
