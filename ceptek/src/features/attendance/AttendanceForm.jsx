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
import { attendanceSchema, attendanceDefaults } from "./attendance.schema";

export default function AttendanceForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending = false,
  employees = [],
}) {
  const { t } = useTranslation(["attendance", "common"]);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attendanceSchema),
    defaultValues: attendanceDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        employee_id: initialData.employees?.id ?? initialData.employee_id ?? "",
        work_date:
          initialData.work_date || new Date().toISOString().split("T")[0],
        check_in: initialData.check_in || "",
        check_out: initialData.check_out || "",
        status: initialData.status || "present",
        notes: initialData.notes || "",
      });
    } else {
      reset(attendanceDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "edit" ? t("common:editItem") : t("attendance:record") + " " + t("attendance:entity")}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="employee_id"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label={t("attendance:employee")}
                  {...field}
                  error={!!errors.employee_id}
                  helperText={errors.employee_id?.message}
                  fullWidth
                >
                  <MenuItem value="">{t("attendance:selectEmployee")}...</MenuItem>
                  {employees.map((e) => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("attendance:workDate")}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register("work_date")}
              error={!!errors.work_date}
              helperText={errors.work_date?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField select label={t("common:status")} {...field} fullWidth>
                  <MenuItem value="present">{t("attendance:present")}</MenuItem>
                  <MenuItem value="absent">{t("attendance:absent")}</MenuItem>
                  <MenuItem value="late">{t("attendance:late")}</MenuItem>
                  <MenuItem value="leave">{t("attendance:leave")}</MenuItem>
                  <MenuItem value="half_day">{t("attendance:halfDay")}</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("attendance:checkIn")}
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register("check_in")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("attendance:checkOut")}
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register("check_out")}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Notes"
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
