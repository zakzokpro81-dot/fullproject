import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Dialog } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { getSalesReturnColumns } from "./salesReturn.columns";
import {
  useSalesReturnQuery,
  useSalesReturnMutations,
} from "./salesReturn.hooks";
import SalesReturnForm from "./SalesReturnForm";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import FilterBar from "../../components/FilterBar";
import { useMessageDialog } from "../../hooks/useMessageDialog";
import MessageDialog from "../../components/MessageDialog";

export default function SalesReturnList() {
  const { t } = useTranslation();
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [openDeleteSelected, setOpenDeleteSelected] = useState(false);

  const { messageDialogState, showMessageDialog, closeMessageDialog } =
    useMessageDialog();

  const {
    rows,
    rowCount,
    isLoading,
    isFetching,
    paginationModel,
    setPaginationModel,
    searchText,
    setSearchText,
  } = useSalesReturnQuery();

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    deleteMultipleMutation,
  } = useSalesReturnMutations({
    onSuccess: () => {
      setFormOpen(false);
      setEditData(null);
    },
    showMessageDialog,
  });

  const handleEdit = useCallback((row) => {
    setEditData({
      invoice_id: row.invoice_id || "",
      invoice_item_id: row.invoice_item_id || "",
      return_date: row.return_date ? row.return_date.split("T")[0] : "",
      quantity: row.quantity ?? 1,
      reason: row.reason || "",
      refund_amount: row.refund_amount ?? 0,
      status_id: row.status_id || "",
      id: row.id,
    });
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((row) => {
    setDeleteTarget(row);
  }, []);

  const handleFormSubmit = (data) => {
    const cleaned = { ...data };
    if (!cleaned.reason) delete cleaned.reason;

    if (editData?.id) {
      updateMutation.mutate({ id: editData.id, data: cleaned });
    } else {
      createMutation.mutate(cleaned);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handlePaginationChange = (m) => {
    setSelectedIds(new Set());
    setPaginationModel(m);
  };

  const toggleSelectAll = () => {
    const all = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
    setSelectedIds(all ? new Set() : new Set(rows.map((r) => r.id)));
  };

  const toggleSelect = (id) => {
    const s = new Set(selectedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedIds(s);
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

  const columns = getSalesReturnColumns(
    handleEdit,
    handleDelete,
    selectedIds,
    toggleSelect,
    rows,
    toggleSelectAll,
    t,
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <FilterBar searchText={searchText} onSearchChange={setSearchText} />
        <Box sx={{ display: "flex", gap: 1 }}>
          {selectedIds.size > 0 && (
            <Button
              variant="contained"
              color="error"
              onClick={() => setOpenDeleteSelected(true)}
            >
              {t("common.deleteSelected")} ({selectedIds.size})
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditData(null);
              setFormOpen(true);
            }}
          >
            {t("common.addNew")} {t("salesReturns.entity")}
          </Button>
        </Box>
      </Box>

      <DataGrid
        rows={rows}
        columns={columns}
        rowCount={rowCount}
        loading={isLoading || isFetching}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        sx={{ bgcolor: "background.paper" }}
      />

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <SalesReturnForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editData}
        />
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`${t("common.deleteSelected")} ${t("salesReturns.entity")}`}
        message={`Are you sure you want to delete this return (ID: ${deleteTarget?.id})?`}
      />

      <ConfirmDeleteDialog
        open={openDeleteSelected}
        itemName={`${selectedIds.size} ${t("common.selectedItems")}`}
        onClose={() => setOpenDeleteSelected(false)}
        onConfirm={handleDeleteSelectedConfirm}
        isPending={deleteMultipleMutation.isPending}
      />

      <MessageDialog {...messageDialogState} onClose={closeMessageDialog} />
    </Box>
  );
}
