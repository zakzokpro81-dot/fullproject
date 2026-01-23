//Form لإضافة أو تعديل Family، يستخدم React Hook Form وZod schema.


// src/features/families/FamilyForm.jsx

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { familySchema } from "./family.schema";
import { getBrands } from "../brands/brand.api";
import { getCategories } from "./category.api";

export default function FamilyForm({ open, onClose, mode, initialData, onSubmit }) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(familySchema),
        defaultValues: {
            name: "",
            slug: "",
            brand: "",
            category: "",
            is_active: true,
        },
    });

    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Fetch brands for select
        getBrands().then((data) => setBrands(data)).catch(console.error);
        getCategories().then((data) => setCategories(data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        } else {
            reset({
                name: "",
                slug: "",
                brand: "",
                category: "",
                is_active: true,
            });
        }
    }, [initialData, reset]);

    const submitHandler = (data) => {
        onSubmit(data);
    };





    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{mode === "add" ? "Add Family" : "Edit Family"}</DialogTitle>

            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Family Name"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="slug"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Slug"
                            error={!!errors.slug}
                            helperText={errors.slug?.message}
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="brand"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} select label="Brand" fullWidth error={!!errors.brand} helperText={errors.brand?.message}>
                            {brands.map((b) => (
                                <MenuItem key={b.id} value={b.id}>
                                    {b.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                />

                <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            label="Category"
                            fullWidth
                            error={!!errors.category}
                            helperText={errors.category?.message}
                        >
                            {categories.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                    {c.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                />

                <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            label="Status"
                            fullWidth
                        >
                            <MenuItem value={true}>Active</MenuItem>
                            <MenuItem value={false}>Inactive</MenuItem>
                        </TextField>
                    )}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit(submitHandler)}>
                    {mode === "add" ? "Add" : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
