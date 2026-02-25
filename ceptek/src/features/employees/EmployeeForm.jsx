import { useEffect } from "react";
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
import { employeeSchema, employeeDefaults } from "./employee.schema";

export default function EmployeeForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending = false,
  departments = [],
  jobTitles = [],
}) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: employeeDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        national_id: initialData.national_id || "",
        hire_date:
          initialData.hire_date || new Date().toISOString().split("T")[0],
        end_date: initialData.end_date || "",
        employment_status: initialData.employment_status || "active",
        department_id:
          initialData.departments?.id ?? initialData.department_id ?? "",
        job_title_id:
          initialData.job_titles?.id ?? initialData.job_title_id ?? "",
        base_salary: initialData.base_salary ?? 0,
        is_active: initialData.is_active ?? true,
      });
    } else {
      reset(employeeDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {mode === "edit" ? "Edit Employee" : "Add Employee"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="First Name"
              fullWidth
              {...register("first_name")}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Last Name"
              fullWidth
              {...register("last_name")}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Email"
              fullWidth
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Phone"
              fullWidth
              {...register("phone")}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField label="Address" fullWidth {...register("address")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="National ID"
              fullWidth
              {...register("national_id")}
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
              label="Hire Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register("hire_date")}
              error={!!errors.hire_date}
              helperText={errors.hire_date?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register("end_date")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="department_id"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Department"
                  {...field}
                  error={!!errors.department_id}
                  helperText={errors.department_id?.message}
                  fullWidth
                >
                  <MenuItem value="">Select Department...</MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="job_title_id"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Job Title"
                  {...field}
                  error={!!errors.job_title_id}
                  helperText={errors.job_title_id?.message}
                  fullWidth
                >
                  <MenuItem value="">Select Job Title...</MenuItem>
                  {jobTitles.map((j) => (
                    <MenuItem key={j.id} value={j.id}>
                      {j.title}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="employment_status"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Employment Status"
                  {...field}
                  fullWidth
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="on_leave">On Leave</MenuItem>
                  <MenuItem value="terminated">Terminated</MenuItem>
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
              label="Active"
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
