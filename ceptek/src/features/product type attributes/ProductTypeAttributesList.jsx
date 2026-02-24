import { useState } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";

import { productTypeAttributesColumns } from "./productTypeAttributes.columns";
import ProductTypeAttributesForm from "./ProductTypeAttributesForm";
import {
  usePTAQuery,
  usePTAMutations,
  usePTAFormOptions,
} from "./productTypeAttributes.hooks";
import { useMessageDialog } from "../../hooks/useMessageDialog";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";

export function ProductTypeAttributesList() {
  const { rows, isLoading, isFetching } = usePTAQuery();
  const { productTypes, attributes } = usePTAFormOptions();

  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeleteSelectedDialog, setOpenDeleteSelectedDialog] =
    useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const { messageDialog, showMessageDialog } = useMessageDialog();

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    deleteMultipleMutation,
  } = usePTAMutations({
    onSuccess: () => setOpenForm(false),
    showMessageDialog,
  });

  const handleOpenAdd = () => {
    setSelectedRow(null);
    setFormMode("add");
    setOpenForm(true);
  };

  const handleOpenEdit = (row) => {
    setSelectedRow(row);
    setFormMode("edit");
    setOpenForm(true);
  };

  const handleOpenDelete = (row) => {
    setSelectedRow(row);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(selectedRow.id);
    setOpenDeleteDialog(false);
    setSelectedRow(null);
  };

  const handleDeleteSelected = () => {
    deleteMultipleMutation.mutate(Array.from(selectedIds));
    setSelectedIds(new Set());
    setOpenDeleteSelectedDialog(false);
  };

  const handleFormSubmit = (data) => {
    if (formMode === "edit") {
      updateMutation.mutate({ id: selectedRow.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleSelectAll = () => {
    if (rows.length > 0 && selectedIds.size === rows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const columns = productTypeAttributesColumns(
    handleOpenEdit,
    handleOpenDelete,
    selectedIds,
    toggleSelect,
    rows,
    toggleSelectAll,
  );

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" fontWeight="bold">
          Product Type Attributes
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            color="error"
            variant="contained"
            disabled={selectedIds.size === 0}
            onClick={() => setOpenDeleteSelectedDialog(true)}
          >
            Delete ({selectedIds.size})
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
          >
            Add
          </Button>
        </Stack>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        loading={isLoading || isFetching}
        autoHeight
        disableRowSelectionOnClick
        sx={{ width: "100%" }}
      />

      <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Attribute Link"
        message="Are you sure you want to delete this product type attribute?"
      />

      <ConfirmDeleteDialog
        open={openDeleteSelectedDialog}
        onClose={() => setOpenDeleteSelectedDialog(false)}
        onConfirm={handleDeleteSelected}
        title="Delete Selected"
        message={`Are you sure you want to delete ${selectedIds.size} item(s)?`}
      />

      <MessageDialog
        open={messageDialog.open}
        onClose={messageDialog.onClose}
        title={messageDialog.title}
        message={messageDialog.message}
        type={messageDialog.type}
      />

      {openForm && (
        <ProductTypeAttributesForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSubmit={handleFormSubmit}
          mode={formMode}
          initialData={selectedRow}
          isPending={createMutation.isPending || updateMutation.isPending}
          productTypes={productTypes}
          attributes={attributes}
        />
      )}

      <ScrollToTopButton />
    </Box>
  );
}
