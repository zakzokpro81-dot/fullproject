import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControlLabel,
  Switch,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, categoryDefaults } from "./category.schema";

export default function CategoryForm({
  open,
  mode = "add",
  initialData = null,
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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: categoryDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({ ...categoryDefaults, ...initialData });
    } else {
      reset(categoryDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {mode === "edit" ? "Edit Category" : "Add Category"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Name"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Slug"
            {...register("slug")}
            error={!!errors.slug}
            helperText={errors.slug?.message}
            fullWidth
            margin="normal"
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

          <FormControlLabel
            control={
              <Switch
                checked={!!watch("show_all_models")}
                onChange={(e) => setValue("show_all_models", e.target.checked)}
              />
            }
            label="Show All Models"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
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
