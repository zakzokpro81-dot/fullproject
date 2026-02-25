import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Grid,
} from "@mui/material";
import {
  supplierPaymentSchema,
  supplierPaymentDefaults,
} from "./supplierPayment.schema";
import { useSupplierPaymentFormOptions } from "./supplierPayment.hooks";

export default function SupplierPaymentForm({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const isEdit = Boolean(initialData);
  const { purchaseInvoices, accounts } = useSupplierPaymentFormOptions();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(supplierPaymentSchema),
    defaultValues: supplierPaymentDefaults,
  });

  useEffect(() => {
    if (open) {
      reset(initialData || supplierPaymentDefaults);
    }
  }, [open, initialData, reset]);

  const submitHandler = (data) => {
    onSubmit(data);
  };

  return (
    <>
      <DialogTitle>
        {isEdit ? "Edit Supplier Payment" : "Add Supplier Payment"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }} maxWidth="md">
          {/* Purchase Invoice */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="purchase_invoice_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Purchase Invoice"
                  fullWidth
                  error={!!errors.purchase_invoice_id}
                  helperText={errors.purchase_invoice_id?.message}
                >
                  {purchaseInvoices.map((inv) => (
                    <MenuItem key={inv.id} value={inv.id}>
                      {inv.invoice_number || `#${inv.id}`}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Account (optional) */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="account_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Account"
                  fullWidth
                  error={!!errors.account_id}
                  helperText={errors.account_id?.message}
                >
                  <MenuItem value="">None</MenuItem>
                  {accounts.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Payment Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="payment_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Payment Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.payment_date}
                  helperText={errors.payment_date?.message}
                />
              )}
            />
          </Grid>

          {/* Amount */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Amount"
                  type="number"
                  fullWidth
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                />
              )}
            />
          </Grid>

          {/* Method */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="method"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Payment Method"
                  fullWidth
                  error={!!errors.method}
                  helperText={errors.method?.message}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="bank">Bank</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          {/* Notes */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notes"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(submitHandler)}
          disabled={isSubmitting}
        >
          {isEdit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </>
  );
}
