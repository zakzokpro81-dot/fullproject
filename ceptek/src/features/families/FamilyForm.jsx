//Form لإضافة أو تعديل Family، يستخدم React Hook Form وZod schema.


// src/features/families/FamilyForm.jsx

import { useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Stack,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { familySchema } from "./family.schema";
import { useQuery } from "@tanstack/react-query";
import supabase from "../../config/supabase";

export default function FamilyForm({ open, onClose, onSubmit, defaultValues }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(familySchema),
        defaultValues,
    });

    // fetch brands
    const { data: brands = [] } = useQuery({
        queryKey: ["brands"],
        queryFn: async () => {
            const { data, error } = await supabase.from("brands").select("id, name");
            if (error) throw error;
            return data;
        },
    });

  // fetch product types
const { data: productTypes = [] } = useQuery({
  queryKey: ["product_types"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("product_types")
      .select("id, name");

    if (error) throw error;
    return data;
  },
});

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {defaultValues?.id ? "Edit Family" : "Add Family"}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <TextField
                        label="Family Name"
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

                    <FormControl fullWidth error={!!errors.brand}>
                        <InputLabel>Brand</InputLabel>
                        <Select defaultValue="" {...register("brand")}>
                            {brands.map((brand) => (
                                <MenuItem key={brand.id} value={brand.id}>
                                    {brand.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth error={!!errors.product_types}>
                        <InputLabel>product types</InputLabel>
                        <Select defaultValue="" {...register("product_types")}>
                            {productTypes.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={<Checkbox {...register("is_active")} defaultChecked />}
                        label="Active"
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit(onSubmit)}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
