import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Typography,
  Stack,
  TextField,
  Paper,
  MenuItem,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import {
  useAttributeOptionQuery,
  useAttributeOptionMutations,
  useAttributesQuery,
} from "./attributeOption.hooks";
import { attributeOptionColumns } from "./attributeOption.columns";
import AttributeOptionForm from "./AttributeOptionForm";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { useMessageDialog } from "../../hooks/useMessageDialog";

export function AttributeOptionList() {
  const { t } = useTranslation();

  // --- UI State ---
  const [selectedItem, setSelectedItem] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDeleteSelected, setOpenDeleteSelected] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [mode, setMode] = useState("add"); // "add" | "edit"

  const { messageDialog, showMessageDialog, closeMessageDialog } =
    useMessageDialog();

  // --- Hooks ---
  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedItem(null);
  };

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
    attributeId,
    setAttributeId,
  } = useAttributeOptionQuery();

  const { data: attributes = [] } = useAttributesQuery();

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    deleteMultipleMutation,
  } = useAttributeOptionMutations({
    onSuccess: handleCloseForm,
    showMessageDialog,
  });

  // --- Handlers ---
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

  const handleDeleteSelectedConfirm = () => {
    if (selectedIds.size === 0) return;
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
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
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

  const columns = attributeOptionColumns(
    handleOpenEdit,
    handleDeleteClick,
    selectedIds,
    toggleSelect,
    rows,
    toggleSelectAll,
    t,
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* ── Header ── */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">{t("attributeOptions.title")}</Typography>
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

      {/* ── Search + Attribute Filter ── */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            label={t("attributeOptions.filterByAttribute")}
            size="small"
            sx={{ minWidth: 200 }}
            value={attributeId}
            onChange={(e) => {
              setAttributeId(e.target.value);
              setPaginationModel((prev) => ({ ...prev, page: 0 }));
            }}
          >
            <MenuItem value="">Show All Attributes</MenuItem>
            {attributes.map((attr) => (
              <MenuItem key={attr.id} value={attr.id}>
                {attr.name} ({attr.data_type})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t("common.search")}
            variant="outlined"
            size="small"
            fullWidth
            sx={{ maxWidth: 400 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Stack>
      </Paper>

      {/* ── Error Banner ── */}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("common.failedToLoad")}: {error?.message || t("common.unknownError")}
        </Alert>
      )}

      {/* ── Data Grid ── */}
      <Paper sx={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          loading={isLoading || isFetching}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          sx={{ width: "100%" }}
        />
      </Paper>

      {/* Dialogs */}
      <AttributeOptionForm
        open={openForm}
        mode={mode}
        initialData={selectedItem}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        attributes={attributes}
      />

      <ConfirmDeleteDialog
        open={openDelete}
        itemName={selectedItem?.value || ""}
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
