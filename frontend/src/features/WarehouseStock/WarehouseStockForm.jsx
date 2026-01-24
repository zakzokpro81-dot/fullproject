import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, MenuItem, Stack, Switch, FormControlLabel } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchWarehouses, fetchProducts } from "./warehouseStock.api";

export function WarehouseStockForm({ onSave, defaultValues }) {
    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            product_id: null,
            warehouse_id: null,
            product_variant_id: null,
            quantity: 0,
            is_active: true,
            ...defaultValues,
        },
    });

    // Reset form عند تغير defaultValues
    useEffect(() => {
        reset({
            product_id: null,
            warehouse_id: null,
            product_variant_id: null,
            quantity: 0,
            is_active: true,
            ...defaultValues,
        });
    }, [defaultValues, reset]);

    // ✅ fetch warehouses & products
    const { data: warehouses = [] } = useQuery({
        queryKey: ["warehouses"],
        queryFn: fetchWarehouses,
    });

    const { data: products = [] } = useQuery({
        queryKey: ["products"],
        queryFn: fetchProducts,
    });

    const onSubmit = (data) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2} padding={2}>
                <Controller
                    name="warehouse_id"
                    control={control}
                    render={({ field }) => (
                        <TextField select label="Warehouse" {...field} required>
                            {warehouses.map((w) => (
                                <MenuItem key={w.id} value={w.id}>
                                    {w.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                />

                <Controller
                    name="product_id"
                    control={control}
                    render={({ field }) => (
                        <TextField select label="Product" {...field} required>
                            {products.map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                />

                <Controller
                    name="quantity"
                    control={control}
                    render={({ field }) => (
                        <TextField type="number" label="Quantity" {...field} required />
                    )}
                />

                <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={<Switch {...field} checked={field.value} />}
                            label="Active"
                        />
                    )}
                />

                <Button type="submit" variant="contained">
                    Save
                </Button>
            </Stack>
        </form>
    );
}
