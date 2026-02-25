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
  purchaseReturnSchema,
  purchaseReturnDefaults,
} from "./purchaseReturn.schema";
import { usePurchaseReturnFormOptions } from "./purchaseReturn.hooks";

export default function PurchaseReturnForm({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const isEdit = Boolean(initialData);
  const { purchaseInvoiceItems, returnStatuses } =
    usePurchaseReturnFormOptions();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(purchaseReturnSchema),
    defaultValues: purchaseReturnDefaults,
  });

  useEffect(() => {
    if (open) {
      reset(initialData || purchaseReturnDefaults);
    }
  }, [open, initialData, reset]);

  const submitHandler = (data) => {
    onSubmit(data);
  };

  return (
    <>
      <DialogTitle>
        {isEdit ? "Edit Purchase Return" : "Add Purchase Return"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Invoice Item */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="purchase_invoice_item_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Invoice Item"
                  fullWidth
                  error={!!errors.purchase_invoice_item_id}
                  helperText={errors.purchase_invoice_item_id?.message}
                >
                  {purchaseInvoiceItems.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      Item #{item.id} (Qty: {item.quantity}, Price:{" "}
                      {item.unit_price})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Status */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="status_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Status"
                  fullWidth
                  error={!!errors.status_id}
                  helperText={errors.status_id?.message}
                >
                  {returnStatuses.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.status_name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Return Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="return_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Return Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.return_date}
                  helperText={errors.return_date?.message}
                />
              )}
            />
          </Grid>

          {/* Quantity */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Quantity"
                  type="number"
                  fullWidth
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message}
                />
              )}
            />
          </Grid>

          {/* Credit Amount */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="credit_amount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Credit Amount"
                  type="number"
                  fullWidth
                  error={!!errors.credit_amount}
                  helperText={errors.credit_amount?.message}
                />
              )}
            />
          </Grid>

          {/* Reason */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Reason"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.reason}
                  helperText={errors.reason?.message}
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
