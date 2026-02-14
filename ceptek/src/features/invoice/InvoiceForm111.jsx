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
  Autocomplete,
  Typography,
  Divider,
  InputAdornment,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoiceSchema } from "./invoice.schema";
import { createInvoiceAction } from "./invoice.api";
import { getAccounts } from "../accounts/account.api";
import supabase from "../../config/supabase";

export default function InvoiceForm({ open, onClose }) {
  const queryClient = useQueryClient();

  // 1. Setup form with default values
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customer_id: 7, // Default to Walk-in Customer (ID: 7)
      warehouse_id: "", // Will be set once data is loaded
      quantity: 1,
      paid_amount: 0,
      unit_price: 0,
    },
  });

  const watchQty = watch("quantity");
  const watchPrice = watch("unit_price");
  const total = (Number(watchQty) || 0) * (Number(watchPrice) || 0);
  const watchWarehouse = watch("warehouse_id");
  const watchAccount = watch("account_id");
  // 2. Fetch Data
  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("warehouses")
        .select("id, name");
      if (error) throw error;
      return data;
    },
  });

  // Effect to set the first warehouse as default once data is loaded
  // كود لتعيين أول مخزن تلقائياً بمجرد تحميل البيانات
  React.useEffect(() => {
    if (warehouses && warehouses.length > 0) {
      setValue("warehouse_id", warehouses[0].id);
    }
  }, [warehouses, setValue]);

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data } = await supabase.from("customers").select("id, name");
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["productsForInvoice"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, sell_price")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  // 3. Mutation Setup
  const mutation = useMutation({
    mutationFn: createInvoiceAction,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
      queryClient.invalidateQueries(["accounts"]);
      queryClient.invalidateQueries(["products"]);
      onClose();
      reset();
    },
    onError: (err) => alert("Sale process failed: " + err.message),
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };
  React.useEffect(() => {
    if (warehouses && warehouses.length > 0 && !watchWarehouse) {
      setValue("warehouse_id", warehouses[0].id);
    }
  }, [warehouses, setValue, watchWarehouse]);


  React.useEffect(() => {
  if (warehouses && warehouses.length > 0 && !watchWarehouse) {
    setValue("warehouse_id", warehouses[0].id);
  }
}, [warehouses, setValue, watchWarehouse]);


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: "bold" }}>Create New Sale</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Customer Selection - Defaults to ID 7 */}
            <TextField
              select
              fullWidth
              label="Customer"
              {...register("customer_id")}
              error={!!errors.customer_id}
              defaultValue={7}
            >
              {customers?.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Warehouse Selection - Defaults to first warehouse in list */}
            <TextField
              select
              fullWidth
              label="Warehouse"
              // ربط القيمة مباشرة بـ watch لضمان التحديث اللحظي
              value={watchWarehouse || ""}
              {...register("warehouse_id")}
              error={!!errors.warehouse_id}
              // إضافة هذا السطر للتأكد من أن MUI يعيد الرندر عند توفر البيانات
              SelectProps={{
                displayEmpty: true,
              }}
            >
              {warehouses?.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name}
                </MenuItem>
              ))}
            </TextField>

            <Divider>Product Details</Divider>

            {/* Product Autocomplete */}
           <Controller
  name="product_id"
  control={control}
  render={({ field }) => (
    <Autocomplete
      options={products || []}
      getOptionLabel={(option) => option ? `${option.name} (${option.sku})` : ""}
      
      // هذه الخاصية تسمح بالبحث عن طريق الاسم أو الباركود (SKU)
      // Custom filter to support searching by Name or SKU (Barcode)
      filterOptions={(options, state) => {
        const displayOptions = options.filter((item) =>
          item.name.toLowerCase().includes(state.inputValue.toLowerCase()) ||
          item.sku?.toLowerCase() === state.inputValue.toLowerCase()
        );

        // منطق احترافي: إذا كان هناك تطابق تام مع الباركود، اختره فوراً
        // If an exact SKU match is found (Scanner input), auto-select it
        if (displayOptions.length === 1 && displayOptions[0].sku === state.inputValue) {
          // تأخير بسيط لضمان استقرار الحالة
          setTimeout(() => {
            field.onChange(displayOptions[0].id);
            setValue("unit_price", displayOptions[0].sell_price);
          }, 100);
        }

        return displayOptions;
      }}

      onChange={(_, val) => {
        field.onChange(val?.id || "");
        if (val) setValue("unit_price", val.sell_price);
      }}
      
      renderInput={(params) => (
        <TextField 
          {...params} 
          label="Scan Barcode or Type Product Name" 
          autoFocus // لجعل المؤشر جاهزاً للقارئ فور فتح النافذة
          error={!!errors.product_id} 
        />
      )}
    />
  )}
/>

            <TextField
              label="Quantity"
              type="number"
              {...register("quantity")}
              fullWidth
            />

            <TextField
              label="Unit Price"
              type="number"
              {...register("unit_price")}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />

            <Divider>Payment</Divider>

           <TextField
  select
  fullWidth
  label="Payment Account / Box"
  value={watchAccount || 1} // ضمان بقاء القيمة 1 كافتراضي
  {...register("account_id")}
  error={!!errors.account_id}
  helperText="Choose where the money goes"
>
  {accounts?.map((a) => (
    <MenuItem key={a.id} value={a.id}>
      {a.name} (Balance: {a.balance})
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
              <Typography variant="overline">Total Amount</Typography>
              <Typography variant="h4" fontWeight="bold">
                ${total.toFixed(2)}
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
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Processing..." : "Confirm Sale"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
