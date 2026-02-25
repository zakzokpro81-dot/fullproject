import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  MenuItem,
  Grid,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplierSchema, supplierDefaults } from "./supplier.schema";

export default function SupplierForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending = false,
  supplierTypes = [],
}) {
  const { t } = useTranslation(["suppliers", "common"]);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplierDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        name: initialData.name || "",
        company_name: initialData.company_name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        phone2: initialData.phone2 || "",
        address: initialData.address || "",
        tax_number: initialData.tax_number || "",
        notes: initialData.notes || "",
        is_active: initialData.is_active ?? true,
        supplier_type_id:
          initialData.supplier_types?.id ?? initialData.supplier_type_id ?? "",
      });
    } else {
      reset(supplierDefaults);
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
            <TextField
              label={t("suppliers:entity")}
              fullWidth
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("suppliers:companyName")}
              fullWidth
              {...register("company_name")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("common:email")}
              fullWidth
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label={t("common:phone")} fullWidth {...register("phone")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label={t("suppliers:phone2")} fullWidth {...register("phone2")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("suppliers:taxNumber")}
              fullWidth
              {...register("tax_number")}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField label={t("common:address")} fullWidth {...register("address")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="supplier_type_id"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label={t("suppliers:supplierType")}
                  {...field}
                  error={!!errors.supplier_type_id}
                  helperText={errors.supplier_type_id?.message}
                  fullWidth
                >
                  <MenuItem value="">{t("suppliers:selectType")}</MenuItem>
                  {supplierTypes.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.type_name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!watch("is_active")}
                  onChange={(e) => setValue("is_active", e.target.checked)}
                />
              }
              label={t("common:active")}
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
