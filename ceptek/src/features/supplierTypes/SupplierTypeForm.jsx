import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  supplierTypeSchema,
  supplierTypeDefaults,
} from "./supplierType.schema";

export default function SupplierTypeForm({
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
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(supplierTypeSchema),
    defaultValues: supplierTypeDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({ type_name: initialData.type_name || "" });
    } else {
      reset(supplierTypeDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "edit" ? t("common.editItem") : t("common.addNew")}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label={t("supplierTypes.typeName")}
          fullWidth
          margin="normal"
          {...register("type_name")}
          error={!!errors.type_name}
          helperText={errors.type_name?.message}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
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
