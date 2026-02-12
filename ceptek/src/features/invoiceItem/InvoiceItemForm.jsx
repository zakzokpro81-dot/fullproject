import * as React from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../../config/supabase";
import {
  saveCompleteInvoice,
  getInvoiceStatuses,
  getCustomersForSelect, // تم التغيير هنا
} from "./invoiceItem.api";

export default function InvoiceForm({ open, onClose }) {
  const queryClient = useQueryClient();

  // State للفاتورة
  const [customerId, setCustomerId] = React.useState("");
  const [statusId, setStatusId] = React.useState("");
  const [invoiceDate, setInvoiceDate] = React.useState(
    new Date().toISOString().split("T")[0],
  );

  // State للأصناف (Items)
  const [items, setItems] = React.useState([]);

  // State لإضافة صنف جديد
  const [tempProduct, setTempProduct] = React.useState({
    variant_id: "",
    qty: 1,
    price: 0,
  });

  // جلب البيانات المساعدة (العملاء، الحالات، المنتجات)
  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => getCustomers({ page: 0, pageSize: 1000 }),
  });
  const { data: statuses } = useQuery({
    queryKey: ["statuses"],
    queryFn: getInvoiceStatuses,
  });
  const { data: variants } = useQuery({
    queryKey: ["variants"],
    queryFn: async () => {
      const { data } = await supabase
        .from("product_variants")
        .select("id, sku, products(name)");
      return data;
    },
  });

  // عملية الحفظ
  const mutation = useMutation({
    mutationFn: (data) => saveCompleteInvoice(data.invoice, data.items),
    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
      onClose();
    },
  });

  const addItem = () => {
    if (!tempProduct.variant_id) return;
    const variant = variants.find((v) => v.id === tempProduct.variant_id);
    const newItem = {
      id: Date.now(),
      product_variant_id: tempProduct.variant_id,
      product_name: `${variant.products.name} (${variant.sku})`,
      quantity: Number(tempProduct.qty),
      unit_price: Number(tempProduct.price),
      total_price: Number(tempProduct.qty) * Number(tempProduct.price),
    };
    setItems([...items, newItem]);
    setTempProduct({ variant_id: "", qty: 1, price: 0 });
  };

  const removeItem = (id) => setItems(items.filter((i) => i.id !== id));

  const handleSave = () => {
    const total = items.reduce((sum, i) => sum + i.total_price, 0);
    const invoiceData = {
      customer_id: customerId,
      status_id: statusId,
      invoice_date: invoiceDate,
      total_amount: total,
      paid_amount: 0,
    };
    mutation.mutate({ invoice: invoiceData, items });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create New Invoice</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* بيانات الفاتورة الأساسية */}
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Customer"
              fullWidth
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              {customers?.data?.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              fullWidth
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
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
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Divider>Invoice Items</Divider>

          {/* إضافة صنف جديد */}
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              select
              label="Product"
              flex={2}
              value={tempProduct.variant_id}
              onChange={(e) =>
                setTempProduct({ ...tempProduct, variant_id: e.target.value })
              }
            >
              {variants?.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.products.name} - {v.sku}
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

          {/* عرض الأصناف المضافة */}
          <Box sx={{ border: "1px solid #eee", borderRadius: 1 }}>
            {items.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                justifyContent="space-between"
                sx={{ p: 1, borderBottom: "1px solid #eee" }}
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
          onClick={handleSave}
          disabled={items.length === 0 || !customerId || mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save Invoice"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
