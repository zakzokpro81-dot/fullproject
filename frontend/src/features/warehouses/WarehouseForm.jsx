import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { warehouseSchema } from './warehouse.schema';
import { TextField, Checkbox, FormControlLabel, Button, Stack } from '@mui/material';

export function WarehouseForm({ defaultValues = {}, onSubmit, onCancel }) {
    // تعيين قيم افتراضية كاملة لتجنب التحذيرات
    const initialValues = {
        name: defaultValues.name ?? '',
        location: defaultValues.location ?? '',
        is_active: defaultValues.is_active ?? true,
    };

    const { handleSubmit, control } = useForm({
        defaultValues: initialValues,
        resolver: zodResolver(warehouseSchema),
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
                {/* اسم المخزن */}
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Name"
                            fullWidth
                            value={field.value ?? ''}
                        />
                    )}
                />

                {/* موقع المخزن */}
                <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Location"
                            fullWidth
                            value={field.value ?? ''}
                        />
                    )}
                />

                {/* حالة التفعيل */}
                <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    {...field}
                                    checked={field.value ?? true} // fallback لقيمة افتراضية
                                />
                            }
                            label="Active"
                        />
                    )}
                />

                {/* الأزرار المعتادة */}
                <Stack direction="row" spacing={1}>
                    <Button type="submit" variant="contained">
                        Save
                    </Button>
                    <Button type="button" variant="outlined" onClick={onCancel}>
                        Cancel
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
}
