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
import { useTranslation } from "react-i18next";
import { categorySchema, categoryDefaults } from "./category.schema";

export default function CategoryForm({
  open,
  mode = "add",
  initialData = null,
  onClose,
  onSubmit,
  isPending = false,
}) {
  const { t } = useTranslation(["categoriesFeature", "common"]);
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
        {mode === "edit" ? t("common:editItem") : `${t("common:addNew")} ${t("categoriesFeature:entity")}`}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <TextField
            label={t("common:name")}
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
            margin="normal"
          />

          <TextField
            label={t("categoriesFeature:slug")}
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
            label={t("common:active")}
          />

          <FormControlLabel
            control={
              <Switch
                checked={!!watch("show_all_models")}
                onChange={(e) => setValue("show_all_models", e.target.checked)}
              />
            }
            label={t("categoriesFeature:showAllModels")}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
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
