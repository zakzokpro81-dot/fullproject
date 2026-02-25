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
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { departmentSchema, departmentDefaults } from "./department.schema";

export default function DepartmentForm({
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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: departmentDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        name: initialData.name || "",
        is_active: initialData.is_active ?? true,
      });
    } else {
      reset(departmentDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "edit" ? t("common.editItem", { item: t("departments.entity") }) : t("common.addNew", { item: t("departments.entity") })}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label={t("departments.departmentName")}
          fullWidth
          margin="normal"
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
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
