import { useState, useCallback } from "react";
import { Box, Button, Dialog } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { getPurchaseInvoiceColumns } from "./purchaseInvoice.columns";
import {
  usePurchaseInvoiceQuery,
  usePurchaseInvoiceMutations,
} from "./purchaseInvoice.hooks";
import PurchaseInvoiceForm from "./PurchaseInvoiceForm";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import FilterBar from "../../components/FilterBar";
import { useMessageDialog } from "../../hooks/useMessageDialog";
import MessageDialog from "../../components/MessageDialog";

export default function PurchaseInvoiceList() {
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
  } = usePurchaseInvoiceQuery();

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    deleteMultipleMutation,
  } = usePurchaseInvoiceMutations({
    onSuccess: () => {
      setFormOpen(false);
      setEditData(null);
    },
    showMessageDialog,
  });

  const handleEdit = useCallback((row) => {
    setEditData({
      invoice_number: row.invoice_number || "",
      supplier_id: row.supplier_id || "",
      purchase_order_id: row.purchase_order_id || "",
      status_id: row.status_id || "",
      invoice_date: row.invoice_date || "",
      total_amount: row.total_amount ?? 0,
      paid_amount: row.paid_amount ?? 0,
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
    if (!cleaned.purchase_order_id) delete cleaned.purchase_order_id;
    if (!cleaned.notes) delete cleaned.notes;
    if (!cleaned.invoice_number) delete cleaned.invoice_number;

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

  const columns = getPurchaseInvoiceColumns(
    handleEdit,
    handleDelete,
    selectedIds,
    toggleSelect,
    rows,
    toggleSelectAll,
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
              Delete Selected ({selectedIds.size})
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
            Add Purchase Invoice
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
        <PurchaseInvoiceForm
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
        title="Delete Purchase Invoice"
        message={`Are you sure you want to delete invoice "${deleteTarget?.invoice_number || deleteTarget?.id}"?`}
      />

      <ConfirmDeleteDialog
        open={openDeleteSelected}
        itemName={`${selectedIds.size} selected items`}
        onClose={() => setOpenDeleteSelected(false)}
        onConfirm={handleDeleteSelectedConfirm}
        isPending={deleteMultipleMutation.isPending}
      />

      <MessageDialog {...messageDialogState} onClose={closeMessageDialog} />
    </Box>
  );
}
