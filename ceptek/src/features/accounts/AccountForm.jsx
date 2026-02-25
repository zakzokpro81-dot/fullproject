import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  FormControlLabel,
  Switch,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { accountSchema, accountDefaults } from "./account.schema";

export default function AccountForm({
  open,
  mode = "add",
  initialData = null,
  onClose,
  onSubmit,
  isPending = false,
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: accountDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({ ...accountDefaults, ...initialData });
    } else {
      reset(accountDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {mode === "edit" ? t("common.editItem", { item: t("accountsFeature.entity") }) : t("common.addNew", { item: t("accountsFeature.entity") })}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <TextField
            label={t("accountsFeature.accountName")}
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
            margin="normal"
          />

          <TextField
            select
            label="Type"
            {...register("account_type")}
            error={!!errors.account_type}
            helperText={errors.account_type?.message}
            fullWidth
            value={watch("account_type")}
          >
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="bank">Bank</MenuItem>
          </TextField>

          <TextField
            label={t("accountsFeature.initialBalance")}
            type="number"
            {...register("balance")}
            error={!!errors.balance}
            helperText={errors.balance?.message}
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch
                checked={!!watch("is_active")}
                onChange={(e) => setValue("is_active", e.target.checked)}
              />
            }
            label={t("common.active")}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
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
