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
import { useTranslation } from "react-i18next";
import { attributeSchema, attributeDefaults } from "./attributes.schema";

export default function AttributeForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending,
}) {
  const { t } = useTranslation(["attributesFeature", "common"]);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attributeSchema),
    defaultValues: attributeDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset(initialData);
    } else {
      reset(attributeDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "edit" ? t("common:editItem", { item: t("attributesFeature:entity") }) : t("common:addNew") + " " + t("attributesFeature:entity")}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
          fullWidth
          margin="normal"
          label={t("common:name")}
        />
        <TextField
          {...register("slug")}
          error={!!errors.slug}
          helperText={errors.slug?.message}
          fullWidth
          margin="normal"
          label={t("attributesFeature:slug")}
        />
        <TextField
          select
          label={t("attributesFeature:dataType")}
          {...register("data_type")}
          fullWidth
          margin="normal"
        >
          <MenuItem value="text">Text</MenuItem>
          <MenuItem value="number">Number</MenuItem>
          <MenuItem value="boolean">Boolean</MenuItem>
        </TextField>
        <FormControlLabel
          control={
            <Switch
              checked={watch("has_options")}
              onChange={(e) => setValue("has_options", e.target.checked)}
            />
          }
          label={t("attributesFeature:hasOptions")}
        />
        <FormControlLabel
          control={
            <Switch
              checked={watch("is_active")}
              onChange={(e) => setValue("is_active", e.target.checked)}
            />
          }
          label={t("common:active")}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          {t("common:cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          startIcon={
            isPending ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isPending ? t("common:saving") : t("common:save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
