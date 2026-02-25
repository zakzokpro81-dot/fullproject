import { useEffect } from "react";
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
import { payrollSchema, payrollDefaults } from "./payroll.schema";

export default function PayrollForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending = false,
  employees = [],
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(payrollSchema),
    defaultValues: payrollDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        employee_id: initialData.employees?.id ?? initialData.employee_id ?? "",
        period: initialData.period || "",
        base_salary: initialData.base_salary ?? 0,
        total_allowances: initialData.total_allowances ?? 0,
        total_deductions: initialData.total_deductions ?? 0,
        net_salary: initialData.net_salary ?? 0,
        status: initialData.status || "draft",
      });
    } else {
      reset(payrollDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {mode === "edit" ? "Edit Payroll" : "Add Payroll"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="employee_id"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Employee"
                  {...field}
                  error={!!errors.employee_id}
                  helperText={errors.employee_id?.message}
                  fullWidth
                >
                  <MenuItem value="">Select Employee...</MenuItem>
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
              label="Period (e.g. 2026-02)"
              fullWidth
              {...register("period")}
              error={!!errors.period}
              helperText={errors.period?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Base Salary"
              type="number"
              fullWidth
              {...register("base_salary")}
              error={!!errors.base_salary}
              helperText={errors.base_salary?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Total Allowances"
              type="number"
              fullWidth
              {...register("total_allowances")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Total Deductions"
              type="number"
              fullWidth
              {...register("total_deductions")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Net Salary"
              type="number"
              fullWidth
              {...register("net_salary")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField select label="Status" {...field} fullWidth>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                </TextField>
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          startIcon={
            isPending ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
