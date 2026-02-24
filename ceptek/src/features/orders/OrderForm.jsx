import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Autocomplete } from "@mui/material";
import { orderSchema, orderDefaults } from "./order.schema";
import { normalizeText } from "../../utils/textUtils";

export default function OrderForm({
  open,
  onClose,
  onSubmit: onSubmitProp,
  isPending,
  customers,
  warehouses,
  products,
  loadingProducts,
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: orderDefaults,
  });

  const [stockError, setStockError] = useState({ open: false, message: "" });

  const warehouseId = watch("warehouse_id");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const handleFormSubmit = (data) => {
    onSubmitProp?.(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", textAlign: "center", py: 2 }}>
        New Sales Order
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Box component="form" noValidate>
          <Stack spacing={4}>
            {/* Header fields */}
            <Stack spacing={2.5}>
              <Controller
                control={control}
                name="customer_id"
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={customers || []}
                    getOptionLabel={(option) => {
                      const customer =
                        customers?.find((c) => c.id === value) || option;
                      return customer?.name || "";
                    }}
                    isOptionEqualToValue={(option, val) =>
                      option.id === (val?.id || val)
                    }
                    value={customers?.find((c) => c.id === value) || null}
                    onChange={(_, newValue) => onChange(newValue ? newValue.id : "")}
                    filterOptions={(options, { inputValue }) => {
                      const normalizedInput = normalizeText(inputValue);
                      return options.filter((c) =>
                        normalizeText(c.name).includes(normalizedInput),
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Customer"
                        error={!!errors.customer_id}
                        helperText={errors.customer_id?.message}
                        placeholder="Search for a customer..."
                      />
                    )}
                  />
                )}
              />

              <TextField
                select
                fullWidth
                label="Warehouse"
                defaultValue=""
                {...register("warehouse_id", { valueAsNumber: true })}
                error={!!errors.warehouse_id}
                helperText={errors.warehouse_id?.message}
              >
                {warehouses?.map((w) => (
                  <MenuItem key={w.id} value={w.id}>
                    {w.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Order Notes"
                {...register("notes")}
              />
            </Stack>

            <Divider>
              <Typography variant="button" sx={{ opacity: 0.7 }}>
                Products List
              </Typography>
            </Divider>

            {/* Items table */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "120px" }}>Qty</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Item Note</TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "50px" }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell sx={{ width: "60%" }}>
                        <Controller
                          control={control}
                          name={`items.${index}.product_id`}
                          render={({ field: { onChange, value } }) => (
                            <Autocomplete
                              disabled={!warehouseId}
                              options={products || []}
                              loading={loadingProducts}
                              getOptionLabel={(option) => {
                                const product =
                                  products?.find((p) => p.id === (option.id || option)) || option;
                                const stockRecord = product?.warehouse_stock;
                                let qty = 0;
                                if (Array.isArray(stockRecord) && stockRecord.length > 0) {
                                  qty = stockRecord[0].quantity;
                                } else if (stockRecord && typeof stockRecord === "object") {
                                  qty = stockRecord.quantity;
                                }
                                return product?.name ? `${product.name} (Available: ${qty})` : "";
                              }}
                              filterOptions={(options, { inputValue }) => {
                                const normalizedInput = normalizeText(inputValue);
                                return options.filter((item) =>
                                  normalizeText(item.name).includes(normalizedInput),
                                );
                              }}
                              isOptionEqualToValue={(option, val) =>
                                option.id === (val?.id || val)
                              }
                              value={products?.find((p) => p.id === value) || null}
                              onChange={(_, newValue) => onChange(newValue ? newValue.id : "")}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  placeholder={
                                    !warehouseId ? "Select warehouse..." : "Search product..."
                                  }
                                  error={!!errors.items?.[index]?.product_id}
                                />
                              )}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          fullWidth
                          size="small"
                          {...register(`items.${index}.quantity`, {
                            valueAsNumber: true,
                            onChange: (e) => {
                              const val = parseFloat(e.target.value);
                              const productId = watch(`items.${index}.product_id`);
                              const product = products?.find((p) => p.id === productId);
                              let available = 0;
                              const stockRecord = product?.warehouse_stock;
                              if (Array.isArray(stockRecord) && stockRecord.length > 0) {
                                available = stockRecord[0].quantity;
                              } else if (stockRecord && typeof stockRecord === "object") {
                                available = stockRecord.quantity;
                              }
                              if (val > available) {
                                setStockError({
                                  open: true,
                                  message: `You are trying to sell ${val} units, but only ${available} are available in stock for "${product?.name}".`,
                                });
                                setValue(`items.${index}.quantity`, available);
                              }
                            },
                          })}
                          error={!!errors.items?.[index]?.quantity}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Note..."
                          {...register(`items.${index}.notes`)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => remove(index)}
                          color="error"
                          disabled={fields.length === 1}
                          size="small"
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => append({ product_id: "", quantity: 1, notes: "" })}
              sx={{ alignSelf: "center", width: 200, borderStyle: "dashed" }}
            >
              Add New Row
            </Button>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit" sx={{ px: 4 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={isPending}
          sx={{ px: 4 }}
        >
          {isPending ? "Saving..." : "Save Sales Order"}
        </Button>
      </DialogActions>

      {/* Stock warning dialog */}
      <Dialog open={stockError.open} onClose={() => setStockError({ open: false, message: "" })}>
        <DialogTitle sx={{ color: "error.main", fontWeight: "bold" }}>
          Stock Insufficient
        </DialogTitle>
        <DialogContent>
          <Typography>{stockError.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setStockError({ open: false, message: "" })}
            variant="contained"
            color="primary"
          >
            Understood
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
