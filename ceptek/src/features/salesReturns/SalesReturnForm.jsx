import { useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { salesReturnSchema, salesReturnDefaults } from "./salesReturn.schema";
import {
  useSalesReturnFormOptions,
  useInvoiceItems,
} from "./salesReturn.hooks";

export default function SalesReturnForm({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const { t } = useTranslation(["salesReturns", "common"]);
  const isEdit = Boolean(initialData);
  const { invoices, returnStatuses } = useSalesReturnFormOptions();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(salesReturnSchema),
    defaultValues: salesReturnDefaults,
  });

  const selectedInvoiceId = watch("invoice_id");
  const invoiceItems = useInvoiceItems(selectedInvoiceId);

  useEffect(() => {
    if (open) {
      reset(initialData || salesReturnDefaults);
    }
  }, [open, initialData, reset]);

  const submitHandler = (data) => {
    onSubmit(data);
  };

  return (
    <>
      <DialogTitle>
        {isEdit ? t("common:editItem") : t("common:addNew")}{" "}
        {t("salesReturns:entity")}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Invoice */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="invoice_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={t("salesReturns:invoice")}
                  fullWidth
                  error={!!errors.invoice_id}
                  helperText={errors.invoice_id?.message}
                >
                  <MenuItem value="">
                    {t("salesReturns:selectInvoice")}
                  </MenuItem>
                  {invoices.map((inv) => (
                    <MenuItem key={inv.id} value={inv.id}>
                      {inv.invoice_number || `#${inv.id}`} —{" "}
                      {inv.customers?.name || ""}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Invoice Item */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="invoice_item_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={t("salesReturns:invoiceItem")}
                  fullWidth
                  error={!!errors.invoice_item_id}
                  helperText={errors.invoice_item_id?.message}
                  disabled={!selectedInvoiceId}
                >
                  <MenuItem value="">{t("salesReturns:selectItem")}</MenuItem>
                  {invoiceItems.map((item) => (
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
                  label={t("common:status")}
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
                  label={t("salesReturns:returnDate")}
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
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
                  label={t("salesReturns:quantity")}
                  type="number"
                  fullWidth
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message}
                />
              )}
            />
          </Grid>

          {/* Refund Amount */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="refund_amount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("salesReturns:refundAmount")}
                  type="number"
                  fullWidth
                  error={!!errors.refund_amount}
                  helperText={errors.refund_amount?.message}
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
                  label={t("salesReturns:reason")}
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
        <Button onClick={onClose}>{t("common:cancel")}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(submitHandler)}
          disabled={isSubmitting}
        >
          {t("common:save")}
        </Button>
      </DialogActions>
    </>
  );
}
