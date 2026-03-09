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
  Grid,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  accountSchema,
  accountDefaults,
  ACCOUNT_TYPES,
  ACCOUNT_SUBTYPES,
} from "./account.schema";

export default function AccountForm({
  open,
  mode = "add",
  initialData = null,
  onClose,
  onSubmit,
  isPending = false,
  parentAccounts = [],
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: accountDefaults,
  });

  const watchType = watch("account_type");
  const subtypes = ACCOUNT_SUBTYPES[watchType] || [];

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        ...accountDefaults,
        ...initialData,
        parent_id: initialData.parent_id || "",
      });
    } else {
      reset(accountDefaults);
    }
  }, [mode, initialData, reset]);

  // Reset subtype when type changes (only in add mode or when user changes type)
  useEffect(() => {
    const currentSubtype = watch("account_subtype");
    if (subtypes.length > 0 && !subtypes.includes(currentSubtype)) {
      setValue("account_subtype", subtypes[0]);
    }
  }, [watchType, subtypes, setValue, watch]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {mode === "edit"
          ? t("common.editItem", { item: t("accountsFeature.entity") })
          : t("common.addNew", { item: t("accountsFeature.entity") })}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label={t("accountsFeature.accountCode")}
              {...register("account_code")}
              error={!!errors.account_code}
              helperText={errors.account_code?.message}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              label={t("accountsFeature.accountName")}
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="account_type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={t("accountsFeature.accountType")}
                  error={!!errors.account_type}
                  helperText={errors.account_type?.message}
                  fullWidth
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {t(`accountsFeature.type_${type}`)}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="account_subtype"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={t("accountsFeature.accountSubtype")}
                  error={!!errors.account_subtype}
                  helperText={errors.account_subtype?.message}
                  fullWidth
                >
                  {subtypes.map((st) => (
                    <MenuItem key={st} value={st}>
                      {t(`accountsFeature.subtype_${st}`)}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="parent_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={t("accountsFeature.parentAccount")}
                  fullWidth
                >
                  <MenuItem value="">{t("common.none")}</MenuItem>
                  {parentAccounts
                    .filter((a) => a.id !== initialData?.id)
                    .map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.account_code} — {a.name}
                      </MenuItem>
                    ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("accountsFeature.openingBalance")}
              type="number"
              {...register("opening_balance")}
              error={!!errors.opening_balance}
              helperText={errors.opening_balance?.message}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!watch("is_active")}
                  onChange={(e) => setValue("is_active", e.target.checked)}
                />
              }
              label={t("common.active")}
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label={t("accountsFeature.description")}
              {...register("description")}
              multiline
              rows={2}
              fullWidth
            />
          </Grid>
        </Grid>
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
