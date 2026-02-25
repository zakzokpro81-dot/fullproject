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
        {mode === "edit" ? "Edit Salary Component" : "Add Salary Component"}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Component Name"
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
              label="Type"
              {...field}
              error={!!errors.type}
              helperText={errors.type?.message}
              fullWidth
              margin="normal"
            >
              <MenuItem value="allowance">Allowance</MenuItem>
              <MenuItem value="deduction">Deduction</MenuItem>
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
          label="Active"
        />
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
