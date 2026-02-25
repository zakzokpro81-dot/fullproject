import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { warehouseSchema, warehouseDefaults } from "./warehouse.schema";

export default function WarehouseForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending,
}) {
  const { t } = useTranslation(["warehousesFeature", "common"]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(warehouseSchema),
    defaultValues: warehouseDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset(initialData);
    } else {
      reset(warehouseDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "edit" ? t("common:editItem", { item: t("warehousesFeature:entity") }) : t("common:addNew")}
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          {...register("name")}
          label={t("common:name")}
          fullWidth
          margin="normal"
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          {...register("location")}
          label={t("warehousesFeature:location")}
          fullWidth
          margin="normal"
          error={!!errors.location}
          helperText={errors.location?.message}
        />

        <FormControlLabel
          control={
            <Switch
              checked={!!watch("is_active")}
              onChange={(e) => setValue("is_active", e.target.checked)}
            />
          }
          label={t("common:active")}
        />
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
