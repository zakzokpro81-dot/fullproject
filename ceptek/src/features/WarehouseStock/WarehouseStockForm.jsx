import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  warehouseStockSchema,
  warehouseStockDefaults,
} from "./warehouseStock.schema";

/**
 * Add / Edit dialog form for Warehouse Stock entries.
 *
 * @param {object}   props
 * @param {boolean}  props.open         - Dialog visibility
 * @param {"add"|"edit"} props.mode     - Form mode
 * @param {object|null} props.initialData - Row data for edit; null for add
 * @param {function} props.onClose      - Close handler
 * @param {function} props.onSubmit     - Called with validated form data
 * @param {boolean}  props.isPending    - Disables Save while mutation is in flight
 * @param {Array}    props.warehouses   - Reference list for Warehouse dropdown
 * @param {Array}    props.products     - Reference list for Product dropdown
 */
export default function WarehouseStockForm({
  open,
  mode = "add",
  initialData = null,
  onClose,
  onSubmit,
  isPending = false,
  warehouses = [],
  products = [],
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(warehouseStockSchema),
    defaultValues: warehouseStockDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        product_id: initialData.products?.id ?? initialData.product_id ?? 0,
        warehouse_id:
          initialData.warehouses?.id ?? initialData.warehouse_id ?? 0,
        quantity: initialData.quantity ?? 1,
        unit_cost: initialData.unit_cost ?? 0,
      });
    } else {
      reset(warehouseStockDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {mode === "add" ? "Add Stock Entry" : "Edit Stock Entry"}
      </DialogTitle>

      <DialogContent dividers>
        {/* Product */}
        <TextField
          select
          label="Product"
          {...register("product_id")}
          fullWidth
          margin="normal"
          error={!!errors.product_id}
          helperText={errors.product_id?.message}
          InputProps={{ readOnly: mode === "edit" }}
        >
          {products.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name} {p.sku ? `(${p.sku})` : ""}
            </MenuItem>
          ))}
        </TextField>

        {/* Warehouse */}
        <TextField
          select
          label="Warehouse"
          {...register("warehouse_id")}
          fullWidth
          margin="normal"
          error={!!errors.warehouse_id}
          helperText={errors.warehouse_id?.message}
          InputProps={{ readOnly: mode === "edit" }}
        >
          {warehouses.map((w) => (
            <MenuItem key={w.id} value={w.id}>
              {w.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Quantity */}
        <TextField
          type="number"
          label="Quantity"
          {...register("quantity")}
          fullWidth
          margin="normal"
          error={!!errors.quantity}
          helperText={errors.quantity?.message}
        />

        {/* Unit Cost */}
        <TextField
          type="number"
          label="Unit Cost"
          {...register("unit_cost")}
          fullWidth
          margin="normal"
          error={!!errors.unit_cost}
          helperText={errors.unit_cost?.message}
          inputProps={{ step: "0.01" }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          startIcon={
            isPending ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
