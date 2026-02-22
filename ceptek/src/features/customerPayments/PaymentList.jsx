import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AddIcon from "@mui/icons-material/Add";

import { getPayments, deletePayment, deletePayments } from "./payment.api";
import { paymentColumns } from "./payment.columns";
import PaymentForm from "./PaymentForm";
import ProductActionDialogs from "../../components/ProductActionDialogs";

export function PaymentList() {
  const queryClient = useQueryClient();

  // States
  const [openForm, setOpenForm] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openDeleteSelectedDialog, setOpenDeleteSelectedDialog] =
    React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState(new Set());
  const [searchText, setSearchText] = React.useState("");
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  // Query
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["payments", paginationModel, searchText],
    queryFn: () =>
      getPayments({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText,
      }),
    keepPreviousData: true,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      queryClient.invalidateQueries(["payments"]);
      setOpenDeleteDialog(false);
      setSelectedPayment(null);
    },
  });

  const rows = data?.data || [];

  // Handlers
  const toggleSelectAll = () => {
    if (rows.length > 0 && selectedIds.size === rows.length) {
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

  const handleDeleteSelected = async () => {
    await deletePayments(Array.from(selectedIds));
    queryClient.invalidateQueries(["payments"]);
    setSelectedIds(new Set());
    setOpenDeleteSelectedDialog(false);
  };

  const columns = paymentColumns(
    (p) => {
      setSelectedPayment(p);
      setOpenForm(true);
    },
    (p) => {
      setSelectedPayment(p);
      setOpenDeleteDialog(true);
    },
    selectedIds,
    toggleSelect,
    rows,
    toggleSelectAll,
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
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Customer Payments
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
              onClick={() => {
                setSelectedPayment(null);
                setOpenForm(true);
              }}
            >
              Add Payment
            </Button>
          </Stack>
        </Stack>

        <TextField
          label="Search by Note or Customer Name"
          size="small"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Paper>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          rowCount={data?.count || 0}
          loading={isLoading || isFetching}
          columns={columns}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableSelectionOnClick
        />
      </Paper>

      <ProductActionDialogs
        openDeleteDialog={openDeleteDialog}
        setOpenDeleteDialog={setOpenDeleteDialog}
        selectedProduct={selectedPayment}
        handleDeleteConfirm={() => deleteMutation.mutate(selectedPayment.id)}
        openDeleteSelectedDialog={openDeleteSelectedDialog}
        setOpenDeleteSelectedDialog={setOpenDeleteSelectedDialog}
        selectedIds={selectedIds}
        handleDeleteSelected={handleDeleteSelected}
      />

      {openForm && (
        <PaymentForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          initialData={selectedPayment}
        />
      )}
    </Box>
  );
}
