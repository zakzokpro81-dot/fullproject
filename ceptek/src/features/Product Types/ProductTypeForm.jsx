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
import { useQuery } from "@tanstack/react-query";

import { productTypeSchema, productTypeDefaults } from "./productType.schema";
import { getCategories } from "../categories/category.api";
import {
  getVariantStrategiesFromDB,
  getTrackingTypes,
} from "./productType.api";

export default function ProductTypeForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending,
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

  // Dropdown data
  const { data: categoriesResult } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  const categories = categoriesResult?.data ?? [];

  const { data: trackingTypes = [] } = useQuery({
    queryKey: ["trackingTypes"],
    queryFn: getTrackingTypes,
    staleTime: 1000 * 60 * 10,
  });

  const { data: variantStrategies = [] } = useQuery({
    queryKey: ["variantStrategies"],
    queryFn: getVariantStrategiesFromDB,
    staleTime: 1000 * 60 * 10,
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
