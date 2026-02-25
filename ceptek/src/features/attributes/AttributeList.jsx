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
import { useTranslation } from "react-i18next";

import { useAttributeQuery, useAttributeMutations } from "./attributes.hooks";
import { attributeColumns } from "./attributes.columns";
import AttributeForm from "./AttributeForm";
import { AttributeFilters } from "./AttributeFilters";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { useMessageDialog } from "../../hooks/useMessageDialog";

export function AttributeList() {
  const { t } = useTranslation(["attributesFeature", "common"]);
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
  } = useAttributeQuery();

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    deleteMultipleMutation,
  } = useAttributeMutations({
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
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (prev.size === rows.length) return new Set();
      return new Set(rows.map((r) => r.id));
    });
  };

  const columns = attributeColumns(
    handleOpenEdit,
    handleDeleteClick,
    selectedIds,
    toggleSelect,
    rows,
    toggleSelectAll,
    t,
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
          {t("attributesFeature:title")}
        </Typography>
        <Stack direction="row" spacing={2}>
          {selectedIds.size > 0 && (
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteSelectedClick}
            >
              {t("common:deleteSelected")} ({selectedIds.size}) {t("common:selectedItems")}
            </Button>
          )}
          <Button variant="contained" onClick={handleOpenAdd}>
            {t("common:addNew")} {t("attributesFeature:entity")}
          </Button>
        </Stack>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder={t("common:search")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <AttributeFilters filters={filters} setFilters={setFilters} />
      </Stack>

      {isError && <Alert severity="error">{t("common:failedToLoad")}: {error.message}</Alert>}

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
          checkboxSelection={false}
          disableRowSelectionOnClick
        />
      </Box>

      <AttributeForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        mode={mode}
        initialData={selectedItem}
        isPending={createMutation.isPending || updateMutation.isPending}
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
