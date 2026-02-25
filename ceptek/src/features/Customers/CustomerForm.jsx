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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {mode === "edit" ? t("common.editItem") : t("common.addNew")}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <TextField
            label={t("customersFeature.fullName")}
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
            margin="normal"
          />

          <TextField label={t("customersFeature.storeName")} {...register("store_name")} fullWidth />

          <TextField
            label={t("customersFeature.emailAddress")}
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
          />

          <TextField label={t("customersFeature.phoneNumber")} {...register("phone")} fullWidth />

          <TextField
            label={t("common.address")}
            {...register("address")}
            fullWidth
            multiline
            rows={3}
          />

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

          <FormControlLabel
            control={
              <Switch
                checked={!!watch("is_active")}
                onChange={(e) => setValue("is_active", e.target.checked)}
              />
            }
            label={t("common.active")}
          />
        </Stack>
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
