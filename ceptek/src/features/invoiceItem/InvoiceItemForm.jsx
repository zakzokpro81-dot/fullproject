import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Box,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceFormSchema, invoiceFormDefaults } from "./invoiceItem.schema";

export default function InvoiceItemForm({
  open,
  onClose,
  onSubmit: onSubmitProp,
  isPending,
  customers,
  statuses,
  variants,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: invoiceFormDefaults,
  });

  const [items, setItems] = useState([]);
  const [tempProduct, setTempProduct] = useState({
    variant_id: "",
    qty: 1,
    price: 0,
  });

  const addItem = () => {
    if (!tempProduct.variant_id) return;
    const variant = variants.find((v) => v.id === tempProduct.variant_id);
    if (!variant) return;
    const newItem = {
      id: Date.now(),
      product_variant_id: tempProduct.variant_id,
      product_name: `${variant.products?.name || "Unknown"} (${variant.sku})`,
      quantity: Number(tempProduct.qty),
      unit_price: Number(tempProduct.price),
      total_price: Number(tempProduct.qty) * Number(tempProduct.price),
    };
    setItems((prev) => [...prev, newItem]);
    setTempProduct({ variant_id: "", qty: 1, price: 0 });
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const handleFormSubmit = (formData) => {
    if (items.length === 0) return;
    const total = items.reduce((sum, i) => sum + i.total_price, 0);
    const invoiceData = {
      customer_id: Number(formData.customer_id),
      status_id: Number(formData.status_id),
      invoice_date: formData.invoice_date,
      total_amount: total,
      paid_amount: 0,
    };
    onSubmitProp?.({ invoice: invoiceData, items });
    reset(invoiceFormDefaults);
    setItems([]);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create New Invoice</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Customer"
              fullWidth
              {...register("customer_id")}
              error={!!errors.customer_id}
              helperText={errors.customer_id?.message}
            >
              {customers?.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              fullWidth
              {...register("status_id")}
              error={!!errors.status_id}
              helperText={errors.status_id?.message}
            >
              {statuses?.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.status_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Date"
              fullWidth
              {...register("invoice_date")}
              error={!!errors.invoice_date}
              helperText={errors.invoice_date?.message}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>

          <Divider>Invoice Items</Divider>

          {/* Add new item */}
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              select
              label="Product"
              sx={{ flex: 2 }}
              value={tempProduct.variant_id}
              onChange={(e) =>
                setTempProduct({ ...tempProduct, variant_id: e.target.value })
              }
            >
              {variants?.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.products?.name || "Unknown"} - {v.sku}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Qty"
              type="number"
              value={tempProduct.qty}
              onChange={(e) =>
                setTempProduct({ ...tempProduct, qty: e.target.value })
              }
              sx={{ width: 80 }}
            />
            <TextField
              label="Price"
              type="number"
              value={tempProduct.price}
              onChange={(e) =>
                setTempProduct({ ...tempProduct, price: e.target.value })
              }
              sx={{ width: 120 }}
            />
            <Button
              variant="contained"
              onClick={addItem}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Stack>

          {/* Items list */}
          <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
            {items.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                justifyContent="space-between"
                sx={{ p: 1, borderBottom: 1, borderColor: "divider" }}
              >
                <Typography>
                  {item.product_name} (x{item.quantity})
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography fontWeight="bold">
                    {item.total_price.toFixed(2)}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeItem(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>
            ))}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Typography sx={{ flexGrow: 1, ml: 2, fontWeight: "bold" }}>
          Grand Total:{" "}
          {items.reduce((sum, i) => sum + i.total_price, 0).toFixed(2)}
        </Typography>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(handleFormSubmit)}
          disabled={items.length === 0 || isPending}
        >
          {isPending ? "Saving..." : "Save Invoice"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
