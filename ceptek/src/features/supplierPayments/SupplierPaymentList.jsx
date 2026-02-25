import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Dialog } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { getSupplierPaymentColumns } from "./supplierPayment.columns";
import {
  useSupplierPaymentQuery,
  useSupplierPaymentMutations,
} from "./supplierPayment.hooks";
import SupplierPaymentForm from "./SupplierPaymentForm";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import FilterBar from "../../components/FilterBar";
import { useMessageDialog } from "../../hooks/useMessageDialog";
import MessageDialog from "../../components/MessageDialog";

export default function SupplierPaymentList() {
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
  } = useSupplierPaymentQuery();

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    deleteMultipleMutation,
  } = useSupplierPaymentMutations({
    onSuccess: () => {
      setFormOpen(false);
      setEditData(null);
    },
    showMessageDialog,
  });

  const handleEdit = useCallback((row) => {
    setEditData({
      purchase_invoice_id: row.purchase_invoice_id || "",
      account_id: row.account_id || "",
      payment_date: row.payment_date || "",
      amount: row.amount ?? 0,
      method: row.method || "cash",
      notes: row.notes || "",
      id: row.id,
    });
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((row) => {
    setDeleteTarget(row);
  }, []);

  const handleFormSubmit = (data) => {
    const cleaned = { ...data };
    if (!cleaned.account_id) delete cleaned.account_id;
    if (!cleaned.notes) delete cleaned.notes;

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

  const columns = getSupplierPaymentColumns(
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
        <FilterBar searchText={searchText} onSearchChange={setSearchText} placeholder={t('common.search')} />
        <Box sx={{ display: "flex", gap: 1 }}>
          {selectedIds.size > 0 && (
            <Button
              variant="contained"
              color="error"
              onClick={() => setOpenDeleteSelected(true)}
            >
              {t('common.deleteSelected')} ({selectedIds.size})
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
            {t('common.addNew')}
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
        maxWidth="sm"
        fullWidth
      >
        <SupplierPaymentForm
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
        title={t('supplierPayments.title')}
        message={`${t('common.deleteSelected')} (ID: ${deleteTarget?.id})?`}
      />

      <ConfirmDeleteDialog
        open={openDeleteSelected}
        itemName={`${selectedIds.size} ${t('common.selectedItems')}`}
        onClose={() => setOpenDeleteSelected(false)}
        onConfirm={handleDeleteSelectedConfirm}
        isPending={deleteMultipleMutation.isPending}
      />

      <MessageDialog {...messageDialogState} onClose={closeMessageDialog} />
    </Box>
  );
}
