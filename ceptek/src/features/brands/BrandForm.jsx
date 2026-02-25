import { useEffect } from "react";
import { useTranslation } from "react-i18next";
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
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandSchema, brandDefaults } from "./brand.schema";

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function BrandForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending = false,
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: brandDefaults,
  });

  const nameValue = watch("name");

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset(initialData);
    } else {
      reset(brandDefaults);
    }
  }, [mode, initialData, reset]);

  useEffect(() => {
    if (nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, setValue]);

  const submitHandler = (data) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "add"
          ? t("common.addNew", { item: t("brands.entity") })
          : t("common.editItem", { item: t("brands.entity") })}
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          label={t("brands.brandName")}
          fullWidth
          margin="normal"
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          label={t("brands.slug")}
          fullWidth
          margin="normal"
          {...register("slug")}
          InputProps={{ readOnly: true }}
          error={!!errors.slug}
          helperText={errors.slug?.message}
        />

        <FormControlLabel
          control={
            <Switch
              checked={watch("is_active")}
              onChange={(e) => setValue("is_active", e.target.checked)}
            />
          }
          label={t("common.active")}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(submitHandler)}
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
