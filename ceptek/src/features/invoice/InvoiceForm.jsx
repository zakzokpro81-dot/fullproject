import { useState, useEffect } from "react";
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
  Autocomplete,
  Typography,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { invoiceSchema } from "./invoice.schema";
import { getProductsForInvoice } from "./invoice.api";

export default function InvoiceForm({
  open,
  onClose,
  onSubmit,
  isPending,
  customers = [],
  warehouses = [],
  accounts = [],
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customer_id: "",
      account_id: "",
      warehouse_id: "",
      items: [],
      paid_amount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchWarehouse = watch("warehouse_id");
  const watchAccount = watch("account_id");
  const watchItems = watch("items") || [];

  const subTotal = watchItems.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    return acc + qty * price;
  }, 0);

  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { data: products } = useQuery({
    queryKey: ["productsForInvoice", watchWarehouse],
    queryFn: () => getProductsForInvoice(watchWarehouse),
    enabled: !!watchWarehouse,
  });

  useEffect(() => {
    if (warehouses.length > 0 && !watchWarehouse) {
      setValue("warehouse_id", warehouses[0].id);
    }
  }, [warehouses, setValue, watchWarehouse]);

  const handleProductSelect = (product) => {
    if (!product) return;

    const existingIndex = fields.findIndex(
      (item) => item.product_id === product.id,
    );
    if (existingIndex > -1) {
      const currentQty = Number(watch(`items.${existingIndex}.quantity`)) || 0;
      setValue(`items.${existingIndex}.quantity`, currentQty + 1);
      const price = Number(watch(`items.${existingIndex}.unit_price`)) || 0;
      setValue(`items.${existingIndex}.total`, (currentQty + 1) * price);
      return;
    }

    append({
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_price: Number(product.sell_price) || 0,
      total: Number(product.sell_price) || 0,
    });
  };

  const handleFormSubmit = (data) => {
    const totalAmount = data.items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0,
    );

    const paid = Number(data.paid_amount);
    let status;
    if (paid === 0) status = "Unpaid";
    else if (paid >= totalAmount) status = "Paid";
    else status = "Partial";

    onSubmit({
      ...data,
      total_amount: totalAmount,
      status_name: status,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: "bold" }}>New Multi-Item Sale</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              select
              fullWidth
              label="Customer"
              {...register("customer_id")}
              defaultValue=""
              error={!!errors.customer_id}
            >
              <MenuItem value="">Select Customer...</MenuItem>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Warehouse"
              value={watchWarehouse || ""}
              {...register("warehouse_id")}
              error={!!errors.warehouse_id}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">Select Warehouse...</MenuItem>
              {warehouses.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name}
                </MenuItem>
              ))}
            </TextField>

            <Divider>Search & Scan Products</Divider>

            <Autocomplete
              options={products || []}
              getOptionLabel={(option) => {
                const stock = option.warehouse_stock?.quantity ?? 0;
                const sku = option.sku ? `[${option.sku}]` : "";
                return `${option.name} ${sku} - Stock: (${stock})`;
              }}
              onChange={(_, val) => handleProductSelect(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Product or Scan Barcode"
                  autoFocus
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
                    <TableCell>Product</TableCell>
                    <TableCell align="center" width={100}>
                      Qty
                    </TableCell>
                    <TableCell align="center" width={120}>
                      Price
                    </TableCell>
                    <TableCell align="center" width={100}>
                      Total
                    </TableCell>
                    <TableCell align="center" width={50} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field, index) => {
                    const qty = watch(`items.${index}.quantity`) || 0;
                    const price = watch(`items.${index}.unit_price`) || 0;
                    const rowTotal = Number(qty) * Number(price);
                    return (
                      <TableRow key={field.id}>
                        <TableCell>{field.product_name}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            {...register(`items.${index}.quantity`, {
                              valueAsNumber: true,
                              min: 1,
                            })}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {Number(price).toFixed(2)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold" }}>
                          {rowTotal.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => remove(index)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider>Payment Details</Divider>

            <TextField
              select
              fullWidth
              label="Payment Account"
              value={watchAccount || ""}
              {...register("account_id")}
              error={!!errors.account_id}
            >
              <MenuItem value="">Select Account...</MenuItem>
              {accounts.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name} ({Number(a.balance).toFixed(2)})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Paid Amount"
              type="number"
              {...register("paid_amount")}
              fullWidth
            />

            <Box
              sx={{
                p: 2,
                bgcolor: "primary.light",
                color: "white",
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="overline">Grand Total</Typography>
              <Typography variant="h4" fontWeight="bold">
                ${subTotal.toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            sx={{ px: 6 }}
          >
            {isPending ? "Saving..." : "Confirm & Save"}
          </Button>
        </DialogActions>
      </Box>

      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, px: 2 } }}
      >
        <DialogTitle sx={{ color: "error.main", fontWeight: "bold" }}>
          Attention Needed
        </DialogTitle>
        <DialogContent>
          <Typography>{errorMessage}</Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2 }}>
          <Button
            onClick={() => setErrorDialogOpen(false)}
            variant="contained"
            color="error"
            fullWidth
          >
            Understood
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
