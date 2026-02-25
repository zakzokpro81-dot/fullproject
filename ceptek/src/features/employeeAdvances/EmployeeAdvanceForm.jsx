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
import {
  employeeAdvanceSchema,
  employeeAdvanceDefaults,
} from "./employeeAdvance.schema";

export default function EmployeeAdvanceForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending = false,
  employees = [],
  accounts = [],
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeAdvanceSchema),
    defaultValues: employeeAdvanceDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        employee_id: initialData.employees?.id ?? initialData.employee_id ?? "",
        amount: initialData.amount ?? 0,
        remaining_amount: initialData.remaining_amount ?? 0,
        reason: initialData.reason || "",
        status: initialData.status || "pending",
        account_id: initialData.accounts?.id ?? initialData.account_id ?? "",
      });
    } else {
      reset(employeeAdvanceDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "edit" ? "Edit Advance" : "Add Advance"}
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
              label="Amount"
              type="number"
              fullWidth
              {...register("amount")}
              error={!!errors.amount}
              helperText={errors.amount?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Remaining Amount"
              type="number"
              fullWidth
              {...register("remaining_amount")}
              error={!!errors.remaining_amount}
              helperText={errors.remaining_amount?.message}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Reason"
              fullWidth
              multiline
              rows={2}
              {...register("reason")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField select label="Status" {...field} fullWidth>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="repaid">Repaid</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="account_id"
              control={control}
              render={({ field }) => (
                <TextField select label="Account" {...field} fullWidth>
                  <MenuItem value="">None</MenuItem>
                  {accounts.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.name}
                    </MenuItem>
                  ))}
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
