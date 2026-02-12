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

import { getInvoices, deleteInvoice } from "./invoice.api";
import { invoiceColumns } from "./invoice.columns";
import InvoiceForm from "./InvoiceForm";
import ProductActionDialogs from "../../componenets/ProductActionDialogs";

export function InvoiceList() {
  const queryClient = useQueryClient();

  // States
  const [openForm, setOpenForm] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] = React.useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  // Query - جلب البيانات من السيرفر
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["invoices", paginationModel, searchText],
    queryFn: () =>
      getInvoices({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText,
      }),
  });

  // Mutation - حذف فاتورة
  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
      setOpenDeleteDialog(false);
      setSelectedInvoice(null);
    },
  });

  const rows = data?.data || [];

  // إعداد الأعمدة مع تمرير دوال التحكم
  const columns = invoiceColumns(
    (inv) => {
      setSelectedInvoice(inv);
      setOpenForm(true);
    }, // التعديل
    (inv) => {
      setSelectedInvoice(inv);
      setOpenDeleteDialog(true);
    }, // الحذف
  );

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {/* الرأس: العنوان وأزرار التحكم */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Invoices Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedInvoice(null);
              setOpenForm(true);
            }}
          >
            Create Invoice
          </Button>
        </Stack>

        <TextField
          label="Search by Customer Name"
          size="small"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Paper>

      {/* الجدول الرئيسي */}
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

      {/* نافذة التأكيد قبل الحذف */}
      <ProductActionDialogs
        openDeleteDialog={openDeleteDialog}
        setOpenDeleteDialog={setOpenDeleteDialog}
        selectedProduct={selectedInvoice}
        handleDeleteConfirm={() => deleteMutation.mutate(selectedInvoice.id)}
      />

      {/* نافذة الفورم (إضافة/تعديل) */}
      {openForm && (
        <InvoiceForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          initialData={selectedInvoice}
        />
      )}
    </Box>
  );
}
