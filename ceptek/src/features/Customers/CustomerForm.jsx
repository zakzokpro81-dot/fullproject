import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  FormControlLabel,
  Switch,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { customerSchema, customerDefaults } from "./customer.schema";

export default function CustomerForm({
  open,
  mode = "add",
  initialData = null,
  onClose,
  onSubmit,
  isPending = false,
  customerTypes = [],
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: customerDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({ ...customerDefaults, ...initialData });
    } else {
      reset(customerDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {mode === "edit" ? t("common.editItem") : t("common.addNew")}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("customersFeature.fullName")}
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("customersFeature.storeName")}
              {...register("store_name")}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("customersFeature.emailAddress")}
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("customersFeature.phoneNumber")}
              {...register("phone")}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("customersFeature.phone2")}
              {...register("phone2")}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("customersFeature.taxNumber")}
              {...register("tax_number")}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label={t("common.address")}
              {...register("address")}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label={t("customersFeature.customerType")}
              {...register("customer_type_id")}
              error={!!errors.customer_type_id}
              helperText={errors.customer_type_id?.message}
              fullWidth
              value={watch("customer_type_id") ?? ""}
            >
              <MenuItem value="">None</MenuItem>
              {customerTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.type_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!watch("is_active")}
                  onChange={(e) => setValue("is_active", e.target.checked)}
                />
              }
              label={t("common.active")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label={t("common.notes")}
              {...register("notes")}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          startIcon={
            isPending ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isPending ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
