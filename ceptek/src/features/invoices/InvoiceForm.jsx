import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Box,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoiceSchema } from "./invoice.schema";
import {
  createInvoice,
  updateInvoice,
  getInvoiceStatuses,
} from "./invoice.api";
import { getCustomers } from "../customers/customer.api";

export default function InvoiceForm({ open, onClose, initialData }) {
  const queryClient = useQueryClient();
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData || {
      customer_id: "",
      invoice_date: new Date().toISOString().split("T")[0],
      total_amount: 0,
      paid_amount: 0,
      status_id: "",
    },
  });

  // 1. جلب الزبائن
  const { data: customersData, isLoading: loadingCust } = useQuery({
    queryKey: ["customersSelect"],
    queryFn: () => getCustomers({ page: 0, pageSize: 1000, searchText: "" }),
  });

  // 2. جلب حالات الفواتير
  const { data: statuses, isLoading: loadingStatus } = useQuery({
    queryKey: ["invoiceStatuses"],
    queryFn: getInvoiceStatuses,
  });

  const mutation = useMutation({
    mutationFn: isEditMode ? updateInvoice : createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
      onClose();
      reset();
    },
  });

  const onSubmit = (data) => {
    if (isEditMode) {
      mutation.mutate({ id: initialData.id, ...data });
    } else {
      mutation.mutate(data);
    }
  };

  const isLoadingData = loadingCust || loadingStatus;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? "Edit Invoice" : "New Invoice"}</DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {isLoadingData ? (
            <Stack alignItems="center" py={3}>
              <CircularProgress size={24} />
            </Stack>
          ) : (
            <Stack spacing={3}>
              {/* اختيار الزبون */}
              <TextField
                select
                fullWidth
                label="Select Customer"
                {...register("customer_id")}
                defaultValue={initialData?.customer_id || ""}
                error={!!errors.customer_id}
                helperText={errors.customer_id?.message}
              >
                {customersData?.data?.map((cust) => (
                  <MenuItem key={cust.id} value={cust.id}>
                    {cust.name} {cust.store_name ? `(${cust.store_name})` : ""}
                  </MenuItem>
                ))}
              </TextField>

              {/* اختيار حالة الفاتورة */}
              <TextField
                select
                fullWidth
                label="Invoice Status"
                {...register("status_id")}
                defaultValue={initialData?.status_id || ""}
                error={!!errors.status_id}
                helperText={errors.status_id?.message}
              >
                {statuses?.map((st) => (
                  <MenuItem key={st.id} value={st.id}>
                    {st.status_name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                {...register("invoice_date")}
                label="Invoice Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.invoice_date}
                helperText={errors.invoice_date?.message}
              />

              <TextField
                {...register("total_amount")}
                label="Total Amount"
                type="number"
                fullWidth
                error={!!errors.total_amount}
                helperText={errors.total_amount?.message}
              />

              <TextField
                {...register("paid_amount")}
                label="Paid Amount"
                type="number"
                fullWidth
                error={!!errors.paid_amount}
                helperText={errors.paid_amount?.message}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending || isLoadingData}
          >
            {mutation.isPending ? "Saving..." : "Save Invoice"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
