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
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "./category.schema";

const defaultFormValues = {
    name: "",
    slug: "",
    is_active: true,
};

export default function CategoryForm({
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
        resolver: zodResolver(categorySchema),
        defaultValues: defaultFormValues,
    });

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
        } else {
            reset(defaultFormValues);
        }
    }, [defaultValues, reset]);

    const handleFormSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {isEditing ? "Edit Category" : "Add Category"}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>
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
