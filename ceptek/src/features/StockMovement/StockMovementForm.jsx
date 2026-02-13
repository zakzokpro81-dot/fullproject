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
} from "@mui/material";
import { useForm, Controller } from "react-hook-form"; // أضفنا Controller
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stockMovementSchema } from "./stockMovement.schema";
import {
  createStockMovement,
  getMovementTypes,
  getWarehouses,
} from "./stockMovement.api";
import supabase from "../../config/supabase";

export default function StockMovementForm({ open, onClose }) {
  const queryClient = useQueryClient();
  function normalizeText(text) {
    if (!text) return "";
    const map = {
      ç: "c",
      ğ: "g",
      ı: "i",
      İ: "i",
      ö: "o",
      ş: "s",
      ü: "u",
      Ç: "c",
      Ğ: "g",
      I: "i",
      Ö: "o",
      Ş: "s",
      Ü: "u",
    };
    return text.replace(/[çğıİöşüÇĞIÖŞÜ]/g, (m) => map[m]).toLowerCase();
  }
  const {
    register,
    handleSubmit,
    control, // مطلوب للـ Autocomplete
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      quantity: 0,
      reference_type: "Manual Adjustment",
    },
  });

  // الاستعلامات (Queries) كما هي
  const { data: types } = useQuery({
    queryKey: ["movTypes"],
    queryFn: getMovementTypes,
  });
  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
  });
  const { data: products } = useQuery({
    queryKey: ["productsForMovement"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: createStockMovement,
    onSuccess: () => {
      queryClient.invalidateQueries(["stockMovements"]);
      queryClient.invalidateQueries(["products"]); // تحديث المخزن في القائمة الرئيسية
      onClose();
      reset();
    },
    onError: (err) => {
      alert("Error saving movement: " + err.message);
    },
  });

  const onSubmit = (data) => {
    // تأكد من تحويل القيم لأرقام إذا كان السكيما يتطلب ذلك
    const payload = {
      ...data,
      product_id: Number(data.product_id),
      warehouse_id: Number(data.warehouse_id),
      movement_type_id: Number(data.movement_type_id),
      quantity: Number(data.quantity),
    };
    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Record Stock Movement</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* حل مشكلة البحث: استخدام Autocomplete */}
            <Controller
              name="product_id"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={products || []} // المنتجات القادمة من جدول products
                  // نحدد أن البحث والعرض يعتمد فقط على حقل name
                  getOptionLabel={(option) => option?.name || ""}
                  // نربط القيمة المختارة بالـ id
                  value={products?.find((p) => p.id === field.value) || null}
                  onChange={(_, val) => field.onChange(val?.id || "")}
                  isOptionEqualToValue={(option, val) => option.id === val?.id}
                  // الفلترة الصارمة (Strict Filtering)
                  filterOptions={(options, state) => {
                    const search = normalizeText(state.inputValue).trim();
                    if (!search) return options;

                    return options.filter((product) => {
                      const productName = normalizeText(product.name);
                      // الفلترة: يجب أن يحتوي الاسم على كلمة البحث تماماً
                      return productName.includes(search);
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Product Name"
                      error={!!errors.product_id}
                      helperText={errors.product_id?.message}
                      fullWidth
                    />
                  )}
                />
              )}
            />
            <TextField
              select
              label="Warehouse"
              {...register("warehouse_id")}
              error={!!errors.warehouse_id}
              fullWidth
              defaultValue=""
            >
              {warehouses?.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Movement Type"
              {...register("movement_type_id")}
              error={!!errors.movement_type_id}
              fullWidth
              defaultValue=""
            >
              {types?.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.movement_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Quantity"
              type="number"
              {...register("quantity")}
              error={!!errors.quantity}
              fullWidth
              helperText={
                errors.quantity
                  ? errors.quantity.message
                  : "Use negative for deductions"
              }
            />

            <TextField
              label="Reference Note"
              {...register("reference_type")}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save Movement"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
