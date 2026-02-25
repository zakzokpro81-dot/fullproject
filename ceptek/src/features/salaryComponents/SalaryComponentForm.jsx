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
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  salaryComponentSchema,
  salaryComponentDefaults,
} from "./salaryComponent.schema";

export default function SalaryComponentForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending = false,
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(salaryComponentSchema),
    defaultValues: salaryComponentDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        name: initialData.name || "",
        type: initialData.type || "allowance",
        is_active: initialData.is_active ?? true,
      });
    } else {
      reset(salaryComponentDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "edit" ? t("common.editItem") : t("common.addNew")} {t("salaryComponents.entity")}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label={t("salaryComponents.componentName")}
          fullWidth
          margin="normal"
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label={t("common.type")}
              {...field}
              error={!!errors.type}
              helperText={errors.type?.message}
              fullWidth
              margin="normal"
            >
              <MenuItem value="allowance">{t("salaryComponents.allowance")}</MenuItem>
              <MenuItem value="deduction">{t("salaryComponents.deduction")}</MenuItem>
            </TextField>
          )}
        />
        <FormControlLabel
          control={
            <Switch
              checked={!!watch("is_active")}
              onChange={(e) => setValue("is_active", e.target.checked)}
            />
          }
          label={t("common.active")}
        />
      </DialogContent>
      <DialogActions>
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
