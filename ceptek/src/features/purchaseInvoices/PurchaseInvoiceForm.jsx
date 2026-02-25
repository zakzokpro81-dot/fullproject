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
import {
  purchaseInvoiceSchema,
  purchaseInvoiceDefaults,
} from "./purchaseInvoice.schema";
import { usePurchaseInvoiceFormOptions } from "./purchaseInvoice.hooks";

export default function PurchaseInvoiceForm({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const { t } = useTranslation();
  const isEdit = Boolean(initialData);
  const { suppliers, purchaseOrders, invoiceStatuses } =
    usePurchaseInvoiceFormOptions();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(purchaseInvoiceSchema),
    defaultValues: purchaseInvoiceDefaults,
  });

  useEffect(() => {
    if (open) {
      reset(initialData || purchaseInvoiceDefaults);
    }
  }, [open, initialData, reset]);

  const submitHandler = (data) => {
    onSubmit(data);
  };

  return (
    <>
      <DialogTitle>
        {isEdit ? t("common.editItem") : t("common.addNew")} {t("purchaseInvoices.entity")}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }} maxWidth="md">
          {/* Invoice Number */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="invoice_number"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("purchaseInvoices.invoiceNumber")}
                  fullWidth
                  error={!!errors.invoice_number}
                  helperText={errors.invoice_number?.message}
                />
              )}
            />
          </Grid>

          {/* Supplier */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="supplier_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={t("purchaseInvoices.supplier")}
                  fullWidth
                  error={!!errors.supplier_id}
                  helperText={errors.supplier_id?.message}
                >
                  {suppliers.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Purchase Order (optional) */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="purchase_order_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={t("purchaseInvoices.purchaseOrder")}
                  fullWidth
                  error={!!errors.purchase_order_id}
                  helperText={errors.purchase_order_id?.message}
                >
                  <MenuItem value="">None</MenuItem>
                  {purchaseOrders.map((po) => (
                    <MenuItem key={po.id} value={po.id}>
                      PO #{po.id}
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
                  label={t("common.status")}
                  fullWidth
                  error={!!errors.status_id}
                  helperText={errors.status_id?.message}
                >
                  {invoiceStatuses.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.status_name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Invoice Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="invoice_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("purchaseInvoices.invoiceDate")}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.invoice_date}
                  helperText={errors.invoice_date?.message}
                />
              )}
            />
          </Grid>

          {/* Total Amount */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="total_amount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("purchaseInvoices.totalAmount")}
                  type="number"
                  fullWidth
                  error={!!errors.total_amount}
                  helperText={errors.total_amount?.message}
                />
              )}
            />
          </Grid>

          {/* Paid Amount */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="paid_amount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("purchaseInvoices.paidAmount")}
                  type="number"
                  fullWidth
                  error={!!errors.paid_amount}
                  helperText={errors.paid_amount?.message}
                />
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
                  label={t("common.notes")}
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
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(submitHandler)}
          disabled={isSubmitting}
        >
          {isSubmitting ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </>
  );
}
