import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";

import { invoiceColumns } from "./invoice.columns";
import InvoiceForm from "./InvoiceForm";
import InvoiceDetailsDrawer from "./InvoiceDetailsDrawer";
import {
  useInvoiceQuery,
  useDailySummaryQuery,
  useInvoiceFormOptions,
  useInvoiceMutations,
} from "./invoice.hooks";
import { useMessageDialog } from "../../hooks/useMessageDialog";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";

export function InvoiceList() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const { messageDialog, showMessageDialog, closeMessageDialog } =
    useMessageDialog();

  const { rows, isLoading, isError, error } = useInvoiceQuery();
  const { summary } = useDailySummaryQuery();
  const { customers, warehouses, accounts } = useInvoiceFormOptions();

  const { createMutation } = useInvoiceMutations({
    onSuccess: () => setOpenForm(false),
    showMessageDialog,
  });

  if (isError) {
    return (
      <Typography color="error">
        Error loading invoices: {error.message}
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Daily summary cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              bgcolor: "success.50",
              borderLeft: "5px solid",
              borderColor: "success.main",
            }}
          >
            <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary">
                Daily Cash (Total Paid)
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.dark">
                ${Number(summary?.total_cash || 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              bgcolor: "warning.50",
              borderLeft: "5px solid",
              borderColor: "warning.main",
            }}
          >
            <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary">
                Daily Debt (Credit)
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="warning.dark">
                ${Number(summary?.total_credit || 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Page header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Invoices & Sales Archive
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          New Sale
        </Button>
      </Box>

      {/* Data grid */}
      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={invoiceColumns}
          loading={isLoading}
          onRowClick={(params) => setSelectedInvoice(params.row)}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      <InvoiceDetailsDrawer
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />

      <InvoiceForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={(payload) => createMutation.mutate(payload)}
        isPending={createMutation.isPending}
        customers={customers}
        warehouses={warehouses}
        accounts={accounts}
      />

      <MessageDialog {...messageDialog} onClose={closeMessageDialog} />
      <ScrollToTopButton />
    </Box>
  );
}
