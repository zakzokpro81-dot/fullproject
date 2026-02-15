import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  MenuItem,
  Stack,
  Switch,
  FormControlLabel,
  Autocomplete,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, getWarehouses } from "./warehouseStock.api";

export function WarehouseStockForm({ onSave, defaultValues }) {
  const { control, handleSubmit, reset } = useForm({
    // تأكد من أن القيم الافتراضية ليست undefined
    defaultValues: {
      product_id: defaultValues?.product_id || "",
      warehouse_id: defaultValues?.warehouse_id || "",
      quantity: defaultValues?.quantity || 0,
      cost_price: defaultValues?.cost_price || 0,
      is_active: defaultValues?.is_active ?? true,
    },
  });

  // تحديث الفورم عند تغيير defaultValues (مثلاً عند تعديل سجل موجود)
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

const onSubmit = async (data) => {
  try {
    // 1. ننتظر رد السيرفر (بفضل mutateAsync)
    await onSave(data);

    // 2. إذا نجحت العملية، نقوم بتصفير الحقول
    // ملاحظة: المكون الأب سيغلق الدايالوج فوراً عبر onSuccess الموجودة في useMutation
    reset(); 
    
  } catch (error) {
    // 3. في حال حدوث خطأ (مثل خطأ الـ SQL الذي واجهناه)
    // الكود سيتوقف هنا، لن يتم تصفير الحقول، ولن يغلق الفورم
    // مما يسمح للمستخدم بتصحيح البيانات أو المحاولة لاحقاً
    console.error("حدث خطأ أثناء الحفظ:", error);
    
    // يمكنك هنا إضافة تنبيه للمستخدم (مثلاً alert أو Snackbar)
  }
};
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} padding={2}>
        {/* Warehouse Selection */}
        <Controller
          name="warehouse_id"
          control={control}
          rules={{ required: "Warehouse is required" }} // إضافة حماية
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              select
              label="Warehouse"
              required
              error={!!error}
              helperText={error?.message}
              // لضمان عدم حدوث خطأ "out of range" إذا كانت القيمة null
              value={field.value || ""} 
            >
              {warehouses.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        {/* Product Selection */}
        <Controller
          name="product_id"
          control={control}
          rules={{ required: "Product is required" }}
          render={({ field, fieldState: { error } }) => (
            <Autocomplete
              options={products}
              getOptionLabel={(option) => option?.name || ""}
              // المقارنة الصحيحة بين الكائن والقيمة المخزنة
              isOptionEqualToValue={(option, value) => option.id === value}
              value={products.find((p) => p.id === field.value) || null}
              onChange={(_, val) => field.onChange(val ? val.id : "")}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Select Product" 
                  required 
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          )}
        />

        {/* Quantity */}
        <Controller
          name="quantity"
          control={control}
          render={({ field }) => (
            <TextField 
              {...field} 
              type="number" 
              label="Quantity" 
              required 
              // تحويل القيمة لرقم لضمان عدم إرسال String للسيرفر
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />

        {/* Cost Price */}
        <Controller
          name="cost_price"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="number"
              label="Cost Price"
              required
              inputProps={{ step: "0.01" }}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />

        {/* Active Status */}
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch {...field} checked={!!field.value} />}
              label="Active"
            />
          )}
        />

        <Button type="submit" variant="contained" size="large">
          Save Stock Movement
        </Button>
      </Stack>
    </form>
  );
}
