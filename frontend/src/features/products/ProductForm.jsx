// src/features/products/ProductForm.jsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Checkbox, FormControlLabel, Box, Autocomplete, MenuItem, Select, InputLabel, FormControl, FormGroup } from '@mui/material';
import { productSchema } from './product.schema';
import { createProduct, getModelsWithBrandAndFamily, getWarehouses, getVariantsWithValues } from './product.api';
import { useQuery, useMutation } from '@tanstack/react-query';

export function ProductForm({ defaultValues = {}, onSuccess }) {
  const { control, handleSubmit, setValue, register, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  // جلب البيانات
  const { data: models = [] } = useQuery({ queryKey: ['modelsWithBrandFamily'], queryFn: getModelsWithBrandAndFamily });
  const { data: warehouses = [] } = useQuery({ queryKey: ['warehouses'], queryFn: getWarehouses });
  const { data: variantsData = [] } = useQuery({ queryKey: ['variantsWithValues'], queryFn: getVariantsWithValues });

  const mutation = useMutation({ mutationFn: createProduct });

  // إعداد خيارات الموديل للـ Autocomplete
  const modelOptions = models.map((m) => ({
    label: `${m.brand_name} ${m.family_name} ${m.model_name}`,
    brand_id: m.brand_id,
    model_id: m.id,
  }));

  // دالة تحويل تركية إلى قياسية للمطابقة
  function normalizeTurkish(str) {
    if (!str) return '';
    return str.toLowerCase('tr')
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'i')
      .replace(/ş/g, 's')
      .replace(/Ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/Ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/Ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/Ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/Ç/g, 'c');
  }

  const onSubmit = async (data) => {
    const warehouseId = data.warehouse_id || (warehouses[0]?.id ?? null);
    if (!warehouseId) return console.error('No warehouse available');

    try {
      await mutation.mutateAsync({
        name: data.name,
        brand_id: data.brand_id,
        model_id: data.model_id,
        sku: data.sku || '',
        cost_price: data.cost_price || 0,
        sell_price: data.sell_price || 0,
        stock: data.stock || 0,
        warehouse_id: warehouseId,
        variants: data.variants || {}, // هنا القيم المختارة لكل Variant
        is_active: data.is_active ?? true,
      });
      console.log('Product created successfully');
      onSuccess?.();
    } catch (err) {
      console.error('Error creating product:', err);
    }
  };

  useEffect(() => {
    console.log('Form errors:', errors);
}, [errors]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>


      {/* Product Name Autocomplete */}
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Autocomplete
            options={modelOptions}
            getOptionLabel={(option) => option.label || ''}
            filterOptions={(options, { inputValue }) =>
              options.filter(o => normalizeTurkish(o.label).includes(normalizeTurkish(inputValue)))
            }
            onChange={(e, value) => {
              if (value) {
                setValue('name', value.label);
                setValue('brand_id', value.brand_id);
                setValue('model_id', value.model_id);
              } else {
                setValue('name', '');
                setValue('brand_id', null);
                setValue('model_id', null);
              }
            }}
            renderInput={(params) => <TextField {...params} label="Product Name" error={!!errors.name} helperText={errors.name?.message} />}
          />
        )}
      />

      {/* Warehouse Dropdown */}
      <Controller
        name="warehouse_id"
        control={control}
        defaultValue={warehouses[0]?.id ?? ''}
        render={({ field }) => (
          <FormControl fullWidth>
            <InputLabel>Warehouse</InputLabel>
            <Select {...field} label="Warehouse">
              {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
            </Select>
          </FormControl>
        )}
      />

      {/* Variants Dynamic */}
     {variantsData.map((variant) => (
  <Controller
    key={variant.id}
    name={`variant_${variant.id}`} // لكل variant اسم مختلف في الفورم
    control={control}
    defaultValue=""
    render={({ field }) => (
      <Autocomplete
        options={variant.values.map(v => v.value)}
        value={field.value}
        onChange={(e, newValue) => field.onChange(newValue)}
        renderInput={(params) => <TextField {...params} label={variant.name} />}
        disableClearable
      />
    )}
  />
))}


 <TextField
  label="Cost Price"
  type="number"
  inputProps={{ step: '0.01' }}
  {...register('cost_price', { valueAsNumber: true })}
  fullWidth
/>

<TextField
  label="Sell Price"
  type="number"
  inputProps={{ step: '0.01' }}
  {...register('sell_price', { valueAsNumber: true })}
  fullWidth
/>

<TextField
  label="Quantity"
  type="number"
  inputProps={{ step: '1', min: 0 }}
  {...register('stock', { valueAsNumber: true })}
  fullWidth
/>


      <FormControlLabel control={<Checkbox {...register('is_active')} />} label="Active" />

      <Button type="submit" variant="contained" color="primary">Save</Button>
    </Box>
  );
}
