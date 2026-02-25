import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
} from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { modelSchema, modelDefaults } from "./model.schema";

export default function ModelForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending = false,
  brands = [],
  families = [],
}) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(modelSchema),
    defaultValues: modelDefaults,
  });

  // ======================
  // Watch fields
  // ======================
  const brandValue = useWatch({ control, name: "brand" });
  const familyValue = useWatch({ control, name: "family" });
  const nameValue = useWatch({ control, name: "name" });

  // ======================
  // Filter families by brand
  // ======================
  const filteredFamilies = families.filter(
    (f) => f.brand === Number(brandValue),
  );

  // ======================
  // Auto slug from name
  // ======================
  useEffect(() => {
    if (nameValue) {
      const slug = nameValue.toLowerCase().replace(/\s+/g, "-");
      setValue("slug", slug);
    }
  }, [nameValue, setValue]);

  // ======================
  // Reset on open
  // ======================
  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset(initialData);
    } else {
      reset(modelDefaults);
    }
  }, [mode, initialData, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{mode === "edit" ? t("common.editItem") : t("common.addNew")}</DialogTitle>

      <DialogContent>
        {/* Brand */}
        <TextField
          select
          fullWidth
          margin="normal"
          label={t("modelsFeature.brand")}
          {...register("brand", { valueAsNumber: true })}
          error={!!errors.brand}
          helperText={errors.brand?.message}
        >
          {brands.map((brand) => (
            <MenuItem key={brand.id} value={brand.id}>
              {brand.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Family */}
        <TextField
          select
          fullWidth
          margin="normal"
          label={t("modelsFeature.family")}
          {...register("family", { valueAsNumber: true })}
          error={!!errors.family}
          helperText={errors.family?.message}
          disabled={!brandValue}
        >
          {filteredFamilies.map((family) => (
            <MenuItem key={family.id} value={family.id}>
              {family.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Model Name */}
        <TextField
          fullWidth
          margin="normal"
          label={t("modelsFeature.modelName")}
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
          disabled={!brandValue || !familyValue}
        />

        {/* Slug */}
        <TextField
          fullWidth
          margin="normal"
          label={t("modelsFeature.slug")}
          {...register("slug")}
          error={!!errors.slug}
          helperText={errors.slug?.message}
          disabled
        />

        {/* is_active */}
        <FormControlLabel
          control={<Switch defaultChecked {...register("is_active")} />}
          label={t("common.active")}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(handleFormSubmit)}
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
