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
  Grid,
  Typography,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  journalEntrySchema,
  journalEntryDefaults,
  TRANSACTION_TYPES,
  emptyLine,
} from "./journalEntry.schema";

export default function JournalEntryForm({
  open,
  mode = "add",
  initialData = null,
  onClose,
  onSubmit,
  isPending = false,
  accounts = [],
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: journalEntryDefaults,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const watchLines = watch("lines") || [];
  const totalDebit = watchLines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = watchLines.reduce(
    (s, l) => s + (Number(l.credit) || 0),
    0,
  );
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;

  useEffect(() => {
    if (mode === "edit" && initialData) {
      const lines = (initialData.journal_entry_lines || []).map((l) => ({
        account_id: l.account_id,
        debit: l.debit || 0,
        credit: l.credit || 0,
        description: l.description || "",
      }));
      reset({
        entry_date:
          initialData.entry_date || new Date().toISOString().slice(0, 10),
        transaction_type: initialData.transaction_type || "manual",
        description: initialData.description || "",
        reference: initialData.reference || "",
        lines:
          lines.length >= 2
            ? lines
            : [...lines, ...Array(2 - lines.length).fill({ ...emptyLine })],
      });
    } else {
      reset(journalEntryDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {mode === "edit"
          ? t("journalFeature.editEntry")
          : t("journalFeature.addEntry")}
      </DialogTitle>

      <DialogContent dividers>
        {/* Header Fields */}
        <Grid container spacing={2} sx={{ mb: 3, mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label={t("journalFeature.entryDate")}
              type="date"
              {...register("entry_date")}
              error={!!errors.entry_date}
              helperText={errors.entry_date?.message}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="transaction_type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={t("journalFeature.transactionType")}
                  error={!!errors.transaction_type}
                  helperText={errors.transaction_type?.message}
                  fullWidth
                >
                  {TRANSACTION_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {t(`journalFeature.type_${type}`)}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label={t("journalFeature.reference")}
              {...register("reference")}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label={t("journalFeature.description")}
              {...register("description")}
              fullWidth
            />
          </Grid>
        </Grid>

        {/* Lines Table */}
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
          {t("journalFeature.entryLines")}
        </Typography>

        {errors.lines?.root && (
          <Typography color="error" variant="body2" sx={{ mb: 1 }}>
            {errors.lines.root.message}
          </Typography>
        )}
        {typeof errors.lines?.message === "string" && (
          <Typography color="error" variant="body2" sx={{ mb: 1 }}>
            {errors.lines.message}
          </Typography>
        )}

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: "35%" }}>
                  {t("journalFeature.account")}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "18%" }}>
                  {t("journalFeature.debit")}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "18%" }}>
                  {t("journalFeature.credit")}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "22%" }}>
                  {t("journalFeature.lineMemo")}
                </TableCell>
                <TableCell sx={{ width: "7%" }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <Controller
                      name={`lines.${index}.account_id`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField
                          {...f}
                          select
                          size="small"
                          fullWidth
                          error={!!errors.lines?.[index]?.account_id}
                        >
                          <MenuItem value="">
                            {t("journalFeature.selectAccount")}
                          </MenuItem>
                          {accounts.map((a) => (
                            <MenuItem key={a.id} value={a.id}>
                              {a.account_code} — {a.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      {...register(`lines.${index}.debit`, {
                        valueAsNumber: true,
                      })}
                      error={!!errors.lines?.[index]?.debit}
                      slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      {...register(`lines.${index}.credit`, {
                        valueAsNumber: true,
                      })}
                      error={!!errors.lines?.[index]?.credit}
                      slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      fullWidth
                      {...register(`lines.${index}.description`)}
                    />
                  </TableCell>
                  <TableCell>
                    {fields.length > 2 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => remove(index)}
                      >
                        <RemoveCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {/* Totals row */}
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      size="small"
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={() => append({ ...emptyLine })}
                    >
                      {t("journalFeature.addLine")}
                    </Button>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="bold">
                    {totalDebit.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="bold">
                    {totalCredit.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell colSpan={2}>
                  <Chip
                    label={
                      isBalanced
                        ? t("journalFeature.balanced")
                        : t("journalFeature.notBalanced")
                    }
                    color={isBalanced ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending || !isBalanced}
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
