import React, { useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    FormControlLabel,
    Switch,
    MenuItem,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import { productTypeSchema } from "./productType.schema";
import { getCategories } from "../categories/category.api";

const defaultFormValues = {
    category_id: "",
    name: "",
    slug: "",
    is_active: true,
};

export default function ProductTypeForm({
    open,
    onClose,
    onSubmit,
    defaultValues = null,
    isEditing = false,
}) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(productTypeSchema),
        defaultValues: defaultFormValues,
    });

    // جلب التصنيفات
    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
        } else {
            reset(defaultFormValues);
        }
    }, [defaultValues, reset]);

    const handleFormSubmit = (data) => {
        onSubmit({
            ...data,
            category_id: Number(data.category_id),
        });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {isEditing ? "Edit Product Type" : "Add Product Type"}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <TextField
                        select
                        label="Category"
                        {...register("category_id")}
                        error={!!errors.category_id}
                        helperText={errors.category_id?.message}
                        fullWidth
                    >
                        {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Name"
                        {...register("name")}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        fullWidth
                    />

                    <TextField
                        label="Slug"
                        {...register("slug")}
                        error={!!errors.slug}
                        helperText={errors.slug?.message}
                        fullWidth
                    />

                    <FormControlLabel
                        control={<Switch {...register("is_active")} defaultChecked />}
                        label="Active"
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit(handleFormSubmit)}>
                    {isEditing ? "Update" : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
