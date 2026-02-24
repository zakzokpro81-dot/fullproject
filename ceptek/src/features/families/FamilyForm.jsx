// FamilyForm.jsx
// Add / Edit dialog form for Families — default export

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
import { familySchema, familyDefaults } from "./family.schema";

export default function FamilyForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending = false,
  brands = [],
  productTypes = [],
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
    resolver: zodResolver(familySchema),
    defaultValues: familyDefaults,
  });

  // Reset form whenever mode or initialData changes
  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        name: initialData.name || "",
        slug: initialData.slug || "",
        brand: initialData.brand?.id ?? initialData.brand ?? "",
        product_type_id:
          initialData.product_types?.id ?? initialData.product_type_id ?? "",
        is_active: initialData.is_active ?? true,
      });
    } else {
      reset(familyDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "edit" ? "Edit Family" : "Add Family"}
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          label="Family Name"
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

        {/* Brand FK select */}
        <Controller
          name="brand"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Brand"
              {...field}
              error={!!errors.brand}
              helperText={errors.brand?.message}
              fullWidth
              margin="normal"
            >
              <MenuItem value="">Select Brand...</MenuItem>
              {brands.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        {/* Product Type FK select */}
        <Controller
          name="product_type_id"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Product Type"
              {...field}
              error={!!errors.product_type_id}
              helperText={errors.product_type_id?.message}
              fullWidth
              margin="normal"
            >
              <MenuItem value="">Select Product Type...</MenuItem>
              {productTypes.map((pt) => (
                <MenuItem key={pt.id} value={pt.id}>
                  {pt.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        {/* Active boolean toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={watch("is_active")}
              onChange={(e) => setValue("is_active", e.target.checked)}
            />
          }
          label="Active"
          sx={{ mt: 1 }}
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
