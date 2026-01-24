// src/features/products/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Checkbox, FormControlLabel, Box, Autocomplete } from '@mui/material';
import { productSchema } from './product.schema';
import { createProduct } from './product.api';
import { useQuery } from '@tanstack/react-query';
import { getModelsWithBrandAndFamily } from './product.api'; // دالة لجلب Models مع Brand وFamily

export function ProductForm({ defaultValues = {}, onSuccess }) {
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  // جلب Models مع Brand و Family
  const { data: models = [] } = useQuery({
    queryKey: ['modelsWithBrandFamily'],
    queryFn: getModelsWithBrandAndFamily,
  });

  // تحويل البيانات لخيارات Autocomplete (اسم كامل)
  const modelOptions = models.map((m) => ({
    label: `${m.brand_name} ${m.family_name} ${m.model_name}`,
    brand_id: m.brand_id,
    model_id: m.id,
  }));

  const onSubmit = async (formData) => {
    try {
      await createProduct({
        name: formData.name,
        brand_id: formData.brand_id,
        model_id: formData.model_id,
        sku: formData.sku || '',
        sell_price: formData.sell_price || 0,
        cost_price: formData.cost_price || 0,
        stock: formData.stock || 0,
        description: formData.description || '',
        is_active: formData.is_active ?? true,
      });
      onSuccess?.(); // تحديث الجدول بعد الإضافة
    } catch (err) {
      console.error('Error creating product:', err);
    }
  };

  function normalizeTurkish(str) {
    if (!str) return '';
    return str
      .toLowerCase('tr')       // lowercase تركية
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



  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
    >
      {/* Autocomplete للمنتج */}
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Autocomplete
            options={modelOptions}
            getOptionLabel={(option) => option.label || ''}
            filterOptions={(options, { inputValue }) => {
              const search = normalizeTurkish(inputValue);
              return options.filter((option) =>
                normalizeTurkish(option.label).includes(search)
              );
            }}

            onChange={(event, newValue) => {
              if (newValue) {
                setValue('name', newValue.label);
                setValue('brand_id', newValue.brand_id);
                setValue('model_id', newValue.model_id);
              } else {
                setValue('name', '');
                setValue('brand_id', null);
                setValue('model_id', null);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Product Name"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        )}
      />

     

      <TextField
        label="Cost Price"
        type="number"
        {...register('cost_price')}
        fullWidth
      />

      <TextField
        label="Sell Price"
        type="number"
        {...register('sell_price')}
        error={!!errors.sell_price}
        helperText={errors.sell_price?.message}
        fullWidth
      />

      <TextField
        label="Stock"
        type="number"
        {...register('stock')}
        fullWidth
      />

      <TextField
        label="Description"
        {...register('description')}
        multiline
        rows={3}
        fullWidth
      />

      <FormControlLabel
        control={<Checkbox {...register('is_active')} />}
        label="Active"
      />

      <Button type="submit" variant="contained" color="primary">
        Save
      </Button>
    </Box>
  );
}
