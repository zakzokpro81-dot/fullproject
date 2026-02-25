import { useEffect } from "react";
import { useTranslation } from "react-i18next";
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
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, paymentDefaults } from "./payment.schema";

export default function PaymentForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending,
  invoices = [],
  accounts = [],
}) {
  const { t } = useTranslation(["customerPayments", "common"]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: paymentDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset(initialData);
    } else {
      reset(paymentDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "edit" ? t("common:editItem") : t("common:addNew")}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              select
              label={t("customerPayments:invoice")}
              fullWidth
              {...register("invoice_id")}
              defaultValue={initialData?.invoice_id ?? ""}
              error={!!errors.invoice_id}
              helperText={errors.invoice_id?.message}
            >
              <MenuItem value="">Select Invoice...</MenuItem>
              {invoices.map((inv) => (
                <MenuItem key={inv.id} value={inv.id}>
                  Inv: {inv.invoice_number || inv.id} - {inv.customers?.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label={t("customerPayments:account")}
              fullWidth
              {...register("account_id")}
              defaultValue={initialData?.account_id ?? ""}
              error={!!errors.account_id}
              helperText={errors.account_id?.message}
            >
              <MenuItem value="">
                {t("customerPayments:selectAccount")}
              </MenuItem>
              {accounts.map((acc) => (
                <MenuItem key={acc.id} value={acc.id}>
                  {acc.name} ({acc.account_type})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t("common:amount")}
              type="number"
              fullWidth
              {...register("amount")}
              error={!!errors.amount}
              helperText={errors.amount?.message}
            />
            <TextField
              label={t("common:date")}
              type="date"
              fullWidth
              {...register("date")}
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.date}
              helperText={errors.date?.message}
            />
            <TextField
              select
              label={t("customerPayments:paymentMethod")}
              fullWidth
              {...register("method")}
              defaultValue={initialData?.method ?? "cash"}
              error={!!errors.method}
              helperText={errors.method?.message}
            >
              <MenuItem value="cash">{t("customerPayments:cash")}</MenuItem>
              <MenuItem value="bank">{t("customerPayments:bank")}</MenuItem>
              <MenuItem value="check">{t("customerPayments:check")}</MenuItem>
            </TextField>
            <TextField
              label={t("common:notes")}
              multiline
              rows={3}
              fullWidth
              {...register("notes")}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t("common:cancel")}</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? t("common:saving") : t("common:save")}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
