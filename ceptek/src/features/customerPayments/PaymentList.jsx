import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";

import { paymentColumns } from "./payment.columns";
import PaymentForm from "./PaymentForm";
import {
  usePaymentQuery,
  usePaymentMutations,
  usePaymentFormOptions,
} from "./payment.hooks";
import { useMessageDialog } from "../../hooks/useMessageDialog";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";

export function PaymentList() {
  const { t } = useTranslation(["customerPayments", "common"]);

  const {
    rows,
    rowCount,
    isLoading,
    isFetching,
    paginationModel,
    setPaginationModel,
    searchText,
    setSearchText,
  } = usePaymentQuery();

  const { invoices, accounts } = usePaymentFormOptions();

  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedPayment, setSelectedPayment] = useState(null);
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
  } = usePaymentMutations({
    onSuccess: () => setOpenForm(false),
    showMessageDialog,
  });

  const handleOpenAdd = () => {
    setSelectedPayment(null);
    setFormMode("add");
    setOpenForm(true);
  };

  const handleOpenEdit = (row) => {
    setSelectedPayment(row);
    setFormMode("edit");
    setOpenForm(true);
  };

  const handleOpenDelete = (row) => {
    setSelectedPayment(row);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(selectedPayment.id);
    setOpenDeleteDialog(false);
    setSelectedPayment(null);
  };

  const handleDeleteSelected = () => {
    deleteMultipleMutation.mutate(Array.from(selectedIds));
    setSelectedIds(new Set());
    setOpenDeleteSelectedDialog(false);
  };

  const handleFormSubmit = (data) => {
    if (formMode === "edit") {
      updateMutation.mutate({ id: selectedPayment.id, data });
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

  const handlePaginationChange = (model) => {
    setPaginationModel(model);
    setSelectedIds(new Set());
  };

  const columns = paymentColumns(
    handleOpenEdit,
    handleOpenDelete,
    selectedIds,
    toggleSelect,
    rows,
    toggleSelectAll,
    t,
  );

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Typography variant="h5" fontWeight="bold">
            {t("customerPayments:title")}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              color="error"
              variant="contained"
              disabled={selectedIds.size === 0}
              onClick={() => setOpenDeleteSelectedDialog(true)}
            >
              {t("common:deleteSelected")} ({selectedIds.size})
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
            >
              {t("common:addNew")}
            </Button>
          </Stack>
        </Stack>

        <TextField
          label={t("customerPayments:searchByNote")}
          size="small"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Paper>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          rowCount={rowCount}
          loading={isLoading || isFetching}
          columns={columns}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          disableRowSelectionOnClick
        />
      </Paper>

      <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title={t("common:deleteSelected")}
        message={t("common:deleteSelected")}
      />

      <ConfirmDeleteDialog
        open={openDeleteSelectedDialog}
        onClose={() => setOpenDeleteSelectedDialog(false)}
        onConfirm={handleDeleteSelected}
        title={t("common:deleteSelected")}
        message={`${t("common:deleteSelected")} (${selectedIds.size})`}
      />

      <MessageDialog
        open={messageDialog.open}
        onClose={messageDialog.onClose}
        title={messageDialog.title}
        message={messageDialog.message}
        type={messageDialog.type}
      />

      {openForm && (
        <PaymentForm
          open={openForm}
          mode={formMode}
          initialData={selectedPayment}
          onClose={() => setOpenForm(false)}
          onSubmit={handleFormSubmit}
          isPending={createMutation.isPending || updateMutation.isPending}
          invoices={invoices}
          accounts={accounts}
        />
      )}

      <ScrollToTopButton />
    </Box>
  );
}
