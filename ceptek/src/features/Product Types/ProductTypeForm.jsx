import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { productTypeSchema, productTypeDefaults } from "./productType.schema";

export default function ProductTypeForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending,
  categories = [],
  trackingTypes = [],
  variantStrategies = [],
}) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productTypeSchema),
    defaultValues: productTypeDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset(initialData);
    } else {
      reset(productTypeDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "edit" ? "Edit Product Type" : "Add Product Type"}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
          fullWidth
          margin="normal"
          label="Name"
        />
        <TextField
          {...register("slug")}
          error={!!errors.slug}
          helperText={errors.slug?.message}
          fullWidth
          margin="normal"
          label="Slug"
        />
        <TextField
          select
          label="Category"
          {...register("category_id")}
          error={!!errors.category_id}
          helperText={errors.category_id?.message}
          fullWidth
          margin="normal"
        >
          <MenuItem value="">Select Category...</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Product Structure"
          {...register("variant_strategy_id")}
          error={!!errors.variant_strategy_id}
          helperText={errors.variant_strategy_id?.message}
          fullWidth
          margin="normal"
        >
          <MenuItem value="">Select Product Structure...</MenuItem>
          {variantStrategies.map((vs) => (
            <MenuItem key={vs.id} value={vs.id}>
              {vs.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Tracking Type"
          {...register("tracking_type_id")}
          error={!!errors.tracking_type_id}
          helperText={errors.tracking_type_id?.message}
          fullWidth
          margin="normal"
        >
          <MenuItem value="">Select Tracking Type...</MenuItem>
          {trackingTypes.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.name}
            </MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          control={
            <Switch
              checked={watch("is_active")}
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
