import React, { useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    TextField,
    CircularProgress,
    Autocomplete,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productTypeAttributesSchema } from "./productTypeAttributes.schema";
import { useQuery } from "@tanstack/react-query";
import {
    getProductTypes,
    getAttributes,
} from "./productTypeAttributes.api";

export default function ProductTypeAttributesForm({
    open,
    onClose,
    onSubmit,
    defaultValues,
    isEditing,
}) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(productTypeAttributesSchema),
        defaultValues,
    });

    useEffect(() => {
        reset(defaultValues || { product_type_id: null, attribute_id: null });
    }, [defaultValues, reset]);

    const { data: productTypes = [], isLoading: loadingProductTypes } = useQuery({
        queryKey: ["product_types"],
        queryFn: getProductTypes,
    });

    const { data: attributes = [], isLoading: loadingAttributes } = useQuery({
        queryKey: ["attributes"],
        queryFn: getAttributes,
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {isEditing ? "Edit Product Type Attribute" : "Add Product Type Attribute"}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <Controller
                        name="product_type_id"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                options={productTypes}
                                getOptionLabel={(option) => option.name || ""}
                                loading={loadingProductTypes}
                                value={
                                    productTypes.find((p) => p.id === field.value) || null
                                }
                                onChange={(_, newValue) =>
                                    field.onChange(newValue ? newValue.id : null)
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Product Type"
                                        error={!!errors.product_type_id}
                                        helperText={errors.product_type_id?.message}
                                    />
                                )}
                            />
                        )}
                    />

                    <Controller
                        name="attribute_id"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                options={attributes}
                                getOptionLabel={(option) => option.name || ""}
                                loading={loadingAttributes}
                                value={attributes.find((a) => a.id === field.value) || null}
                                onChange={(_, newValue) =>
                                    field.onChange(newValue ? newValue.id : null)
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Attribute"
                                        error={!!errors.attribute_id}
                                        helperText={errors.attribute_id?.message}
                                    />
                                )}
                            />
                        )}
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit(onSubmit)}>
                    {isEditing ? "Update" : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
