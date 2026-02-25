import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Grid,
  Divider,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import {
  purchaseInvoiceSchema,
  purchaseInvoiceDefaults,
} from "./purchaseInvoice.schema";
import {
  usePurchaseInvoiceFormOptions,
  useProductsForPurchase,
} from "./purchaseInvoice.hooks";

export default function PurchaseInvoiceForm({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const { t } = useTranslation();
  const isEdit = Boolean(initialData);
  const { suppliers, purchaseOrders, invoiceStatuses } =
    usePurchaseInvoiceFormOptions();
  const products = useProductsForPurchase();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(purchaseInvoiceSchema),
    defaultValues: purchaseInvoiceDefaults,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchItems = watch("items") || [];

  const itemsTotal = watchItems.reduce((acc, item) => {
    return acc + (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0);
  }, 0);

  useEffect(() => {
    if (open) {
      reset(initialData || purchaseInvoiceDefaults);
    }
  }, [open, initialData, reset]);

  // Auto-update total_amount when items change
  useEffect(() => {
    if (watchItems.length > 0) {
      setValue("total_amount", itemsTotal);
    }
  }, [itemsTotal, watchItems.length, setValue]);

  const handleProductSelect = (product) => {
    if (!product) return;
    const existingIndex = fields.findIndex((f) => f.product_id === product.id);
    if (existingIndex > -1) {
      const currentQty = Number(watch(`items.${existingIndex}.quantity`)) || 0;
      setValue(`items.${existingIndex}.quantity`, currentQty + 1);
      return;
    }
    append({
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_cost: Number(product.cost_price) || 0,
    });
  };

  const submitHandler = (data) => {
    onSubmit(data);
  };

  return (
    <>
      <DialogTitle>
        {isEdit ? t("common.editItem") : t("common.addNew")}{" "}
        {t("purchaseInvoices.entity")}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Invoice Number */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="invoice_number"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("purchaseInvoices.invoiceNumber")}
                  fullWidth
                  error={!!errors.invoice_number}
                  helperText={errors.invoice_number?.message}
                />
              )}
            />
          </Grid>

          {/* Supplier */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="supplier_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={t("purchaseInvoices.supplier")}
                  fullWidth
                  error={!!errors.supplier_id}
                  helperText={errors.supplier_id?.message}
                >
                  {suppliers.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Purchase Order (optional) */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="purchase_order_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={t("purchaseInvoices.purchaseOrder")}
                  fullWidth
                  error={!!errors.purchase_order_id}
                  helperText={errors.purchase_order_id?.message}
                >
                  <MenuItem value="">—</MenuItem>
                  {purchaseOrders.map((po) => (
                    <MenuItem key={po.id} value={po.id}>
                      PO #{po.id}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Status */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="status_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={t("common.status")}
                  fullWidth
                  error={!!errors.status_id}
                  helperText={errors.status_id?.message}
                >
                  {invoiceStatuses.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.status_name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Invoice Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="invoice_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("purchaseInvoices.invoiceDate")}
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors.invoice_date}
                  helperText={errors.invoice_date?.message}
                />
              )}
            />
          </Grid>

          {/* Paid Amount */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="paid_amount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("purchaseInvoices.paidAmount")}
                  type="number"
                  fullWidth
                  error={!!errors.paid_amount}
                  helperText={errors.paid_amount?.message}
                />
              )}
            />
          </Grid>

          {/* Notes */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("common.notes")}
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                />
              )}
            />
          </Grid>
        </Grid>

        {/* ── Items Section ── */}
        <Divider sx={{ my: 3 }}>{t("purchaseInvoices.items")}</Divider>

        <Autocomplete
          options={products}
          getOptionLabel={(o) => {
            const sku = o.sku ? ` [${o.sku}]` : "";
            return `${o.name}${sku}`;
          }}
          onChange={(_, val) => handleProductSelect(val)}
          value={null}
          blurOnSelect
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("purchaseInvoices.searchProduct")}
              size="small"
              sx={{ mb: 2 }}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <AddShoppingCartIcon color="primary" sx={{ mr: 1 }} />
                ),
              }}
            />
          )}
        />

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>{t("purchaseInvoices.product")}</TableCell>
                <TableCell align="center" width={90}>
                  {t("purchaseInvoices.qty")}
                </TableCell>
                <TableCell align="center" width={120}>
                  {t("purchaseInvoices.unitCost")}
                </TableCell>
                <TableCell align="center" width={120}>
                  {t("purchaseInvoices.lineTotal")}
                </TableCell>
                <TableCell width={50} />
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: 3, color: "text.secondary" }}
                  >
                    {t("purchaseInvoices.noItems")}
                  </TableCell>
                </TableRow>
              )}
              {fields.map((field, index) => {
                const qty = Number(watch(`items.${index}.quantity`)) || 0;
                const cost = Number(watch(`items.${index}.unit_cost`)) || 0;
                return (
                  <TableRow key={field.id}>
                    <TableCell>
                      {field.product_name || `Product #${field.product_id}`}
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`items.${index}.quantity`}
                        control={control}
                        render={({ field: f }) => (
                          <TextField
                            {...f}
                            type="number"
                            size="small"
                            sx={{ width: 80 }}
                            inputProps={{ min: 1 }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`items.${index}.unit_cost`}
                        control={control}
                        render={({ field: f }) => (
                          <TextField
                            {...f}
                            type="number"
                            size="small"
                            sx={{ width: 110 }}
                            inputProps={{ min: 0 }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      {(qty * cost).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => remove(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Total summary */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "primary.light",
            color: "white",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="overline">
            {t("purchaseInvoices.totalAmount")}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {itemsTotal.toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(submitHandler)}
          disabled={isSubmitting}
        >
          {isSubmitting ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </>
  );
}
