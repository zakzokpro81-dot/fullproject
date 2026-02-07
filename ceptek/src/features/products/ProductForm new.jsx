import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    MenuItem,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "./product.schema";
import { useQuery } from "@tanstack/react-query";
import supabase from "../../config/supabase";
import { useEffect } from "react";
import ModelAutocomplete from "./ModelAutocomplete"; // مكون الموديلات المنفصل

export default function ProductForm({ open, onClose, onSubmit, defaultValues }) {
    const {
        register,
        handleSubmit,
        setValue,
        control,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            product_type: "",
            part_type_id: "",
            model_id: "",
            name: "",
            sell_price: 0,
            cost_price: 0,
            stock: 0,
            is_active: true,
            description: "",
            warehouse_id: "",
            attributes: {},
        },
    });

    const selectedProductType = watch("product_type");
    const selectedPartTypeId = watch("part_type_id");

    // Data States
    const { data: productTypes = [] } = useQuery({
        queryKey: ["product-types"],
        queryFn: async () => [
            { id: "spare_part", name: "Spare Part" },
            { id: "accessory", name: "Accessory" },
            { id: "electronics", name: "Electronics" },
        ],
    });

    const { data: partTypes = [] } = useQuery({
        queryKey: ["part-types", selectedProductType],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("part_types")
                .select("*")
                .eq("product_type", selectedProductType)
                .eq("is_active", true);
            if (error) throw error;
            return data;
        },
        enabled: !!selectedProductType,
    });

    const { data: attributes = [] } = useQuery({
        queryKey: ["attributes", selectedPartTypeId],
        queryFn: async () => {
            if (!selectedPartTypeId) return [];
            const { data, error } = await supabase
                .from("product_attributes")
                .select("id, name")
                .eq("part_type_id", selectedPartTypeId);
            if (error) throw error;
            return data;
        },
        enabled: !!selectedPartTypeId,
    });

    const { data: warehouses = [], isLoading: warehousesLoading } = useQuery({
        queryKey: ["warehouses"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("warehouses")
                .select("id, name")
                .eq("is_active", true)
                .order("id", { ascending: true });
            if (error) throw error;
            return data;
        },
    });

    // Reset form on defaultValues
    useEffect(() => {
        if (defaultValues) reset({ ...defaultValues });
        else
            reset({
                product_type: "",
                part_type_id: "",
                model_id: "",
                name: "",
                sell_price: 0,
                cost_price: 0,
                stock: 0,
                is_active: true,
                description: "",
                warehouse_id: "",
                attributes: {},
            });
    }, [defaultValues, reset]);

    const handleFormSubmit = (data) => {
        const payload = {
            ...data,
            sell_price: Number(data.sell_price),
            cost_price: Number(data.cost_price),
            stock: Number(data.stock),
            attributes: data.attributes,
        };
        onSubmit(payload);
        reset();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{defaultValues ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogContent>
                {/* Product Type */}
                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Product Type"
                    {...register("product_type")}
                    error={!!errors.product_type}
                    helperText={errors.product_type?.message}
                >
                    {productTypes.map((pt) => (
                        <MenuItem key={pt.id} value={pt.id}>
                            {pt.name}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Part Type */}
                {selectedProductType && (
                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        label="Part Type"
                        {...register("part_type_id")}
                        error={!!errors.part_type_id}
                        helperText={errors.part_type_id?.message}
                    >
                        {partTypes.map((pt) => (
                            <MenuItem key={pt.id} value={pt.id}>
                                {pt.name}
                            </MenuItem>
                        ))}
                    </TextField>
                )}

                {/* Model Autocomplete */}
                {selectedProductType === "spare_part" && (
                    <ModelAutocomplete field={control.register("model")} selectedProductType={selectedProductType} />
                )}

                {/* Dynamic Attributes */}
                {attributes.map((attr) => (
                    <TextField
                        key={attr.id}
                        fullWidth
                        margin="normal"
                        label={attr.name}
                        {...register(`attributes.${attr.id}`)}
                    />
                ))}

                {/* General Fields */}
                <TextField
                    fullWidth
                    margin="normal"
                    label="Sell Price"
                    type="number"
                    {...register("sell_price", { valueAsNumber: true })}
                    error={!!errors.sell_price}
                    helperText={errors.sell_price?.message}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Cost Price"
                    type="number"
                    {...register("cost_price", { valueAsNumber: true })}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Stock"
                    type="number"
                    {...register("stock", { valueAsNumber: true })}
                />
                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Warehouse"
                    {...register("warehouse_id")}
                    disabled={warehousesLoading}
                >
                    {warehouses.map((w) => (
                        <MenuItem key={w.id} value={w.id}>
                            {w.name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Description"
                    multiline
                    rows={3}
                    {...register("description")}
                />
                <FormControlLabel
                    control={<Switch defaultChecked {...register("is_active")} />}
                    label="Active"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit(handleFormSubmit)}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
