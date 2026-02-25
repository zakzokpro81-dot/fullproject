import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  MenuItem,
  Grid,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  purchaseOrderSchema,
  purchaseOrderDefaults,
} from "./purchaseOrder.schema";

export default function PurchaseOrderForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending = false,
  suppliers = [],
  warehouses = [],
  orderStatuses = [],
}) {
  const { t } = useTranslation(["purchaseOrders", "common"]);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: purchaseOrderDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        supplier_id: initialData.suppliers?.id ?? initialData.supplier_id ?? "",
        warehouse_id:
          initialData.warehouses?.id ?? initialData.warehouse_id ?? "",
        order_date: initialData.order_date
          ? initialData.order_date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        total_amount: initialData.total_amount ?? 0,
        notes: initialData.notes || "",
        status_id: initialData.order_statuses?.id ?? initialData.status_id ?? 1,
      });
    } else {
      reset(purchaseOrderDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {mode === "edit" ? t("common:editItem") : t("common:addNew")}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="supplier_id"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label={t("purchaseOrders:supplier")}
                  {...field}
                  error={!!errors.supplier_id}
                  helperText={errors.supplier_id?.message}
                  fullWidth
                >
                  <MenuItem value="">{t("purchaseOrders:selectSupplier")}</MenuItem>
                  {suppliers.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="warehouse_id"
              control={control}
              render={({ field }) => (
                <TextField select label={t("purchaseOrders:warehouse")} {...field} fullWidth>
                  <MenuItem value="">{t("purchaseOrders:selectWarehouse")}</MenuItem>
                  {warehouses.map((w) => (
                    <MenuItem key={w.id} value={w.id}>
                      {w.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("purchaseOrders:orderDate")}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register("order_date")}
              error={!!errors.order_date}
              helperText={errors.order_date?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("purchaseOrders:totalAmount")}
              type="number"
              fullWidth
              {...register("total_amount")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="status_id"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label={t("common:status")}
                  {...field}
                  error={!!errors.status_id}
                  helperText={errors.status_id?.message}
                  fullWidth
                >
                  {orderStatuses.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.status_name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label={t("common:notes")}
              fullWidth
              multiline
              rows={2}
              {...register("notes")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          {t("common:cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          startIcon={
            isPending ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isPending ? t("common:saving") : t("common:save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
