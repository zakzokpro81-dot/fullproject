import * as React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack,Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stockMovementSchema } from "./stockMovement.schema";
import { createStockMovement, getMovementTypes, getWarehouses } from "./stockMovement.api";
import supabase from "../../config/supabase";

export default function StockMovementForm({ open, onClose }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(stockMovementSchema)
  });

  // جلب البيانات للقوائم المنسدلة
  const { data: types } = useQuery({ queryKey: ["movTypes"], queryFn: getMovementTypes });
  const { data: warehouses } = useQuery({ queryKey: ["warehouses"], queryFn: getWarehouses });
  // داخل StockMovementForm.jsx
const { data: products } = useQuery({
  queryKey: ["productsForMovement"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, sku")
      .eq("is_active", true) // جلب المنتجات النشطة فقط
      .order("name");
    
    if (error) throw error;
    return data;
  }
});

  const { data: variants } = useQuery({
  queryKey: ["variantsForMovement"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("product_variants")
      .select(`
        id,
        product_id,
        sku,
        products (
          name
        )
      `);
    
    if (error) {
      console.error("Error fetching variants:", error);
      return [];
    }
    return data;
  }
});

  const mutation = useMutation({
    mutationFn: createStockMovement,
    onSuccess: () => {
      queryClient.invalidateQueries(["stockMovements"]);
      onClose(); reset();
    }
  });

  const onSubmit = (data) => {
    const variant = variants.find(v => v.id === data.product_variant_id);
    mutation.mutate({ ...data, product_id: variant.product_id });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Record Stock Movement</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={2}>
          <TextField
  select
  label="Product"
  {...register("product_id")} // لاحظ هنا نستخدم product_id مباشرة
  error={!!errors.product_id}
  fullWidth
  defaultValue=""
>
  {products?.map((p) => (
    <MenuItem key={p.id} value={p.id}>
      {p.name} {p.sku ? `(${p.sku})` : ""}
    </MenuItem>
  ))}
</TextField>
            <TextField select label="Warehouse" {...register("warehouse_id")} error={!!errors.warehouse_id} fullWidth>
              {warehouses?.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
            </TextField>
          <TextField 
  select 
  label="Movement Type" 
  {...register("movement_type_id")} 
  fullWidth
>
  {types?.map(t => (
    <MenuItem key={t.id} value={t.id}>
      {t.movement_name} {/* تم التعديل هنا */}
    </MenuItem>
  ))}
</TextField>

            <TextField label="Quantity" type="number" {...register("quantity")} error={!!errors.quantity} fullWidth helperText="Use negative for deductions" />
            <TextField label="Reference Note" {...register("reference_type")} fullWidth placeholder="e.g. Manual Adjustment" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>Save Movement</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}