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
import { jobTitleSchema, jobTitleDefaults } from "./jobTitle.schema";

export default function JobTitleForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending = false,
  departments = [],
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
    resolver: zodResolver(jobTitleSchema),
    defaultValues: jobTitleDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        title: initialData.title || "",
        department_id:
          initialData.departments?.id ?? initialData.department_id ?? "",
        is_active: initialData.is_active ?? true,
      });
    } else {
      reset(jobTitleDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "edit" ? t("common.editItem") + " " + t("jobTitles.entity") : t("common.addNew") + " " + t("jobTitles.entity")}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label={t("jobTitles.jobTitle")}
          fullWidth
          margin="normal"
          {...register("title")}
          error={!!errors.title}
          helperText={errors.title?.message}
        />
        <Controller
          name="department_id"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label={t("jobTitles.department")}
              {...field}
              error={!!errors.department_id}
              helperText={errors.department_id?.message}
              fullWidth
              margin="normal"
            >
              <MenuItem value="">{t("jobTitles.selectDepartment")}</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
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
