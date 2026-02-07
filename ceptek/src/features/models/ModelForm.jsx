import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    FormControlLabel,
    Switch,
} from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { modelSchema } from "./model.schema";
import { useQuery } from "@tanstack/react-query";
import { getBrands } from "../brands/brand.api";
import { getFamilies } from "../families/family.api";
import { useEffect } from "react";

export default function ModelForm({
    open,
    onClose,
    onSubmit,
    defaultValues,
}) {
    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(modelSchema),
        defaultValues,
    });

    // ======================
    // Fetch brands & families
    // ======================
    const { data: brands = [] } = useQuery({
        queryKey: ["brands"],
        queryFn: getBrands,
    });

    const { data: families = [] } = useQuery({
        queryKey: ["families"],
        queryFn: getFamilies,
    });

    // ======================
    // Watch fields
    // ======================
    const brandValue = useWatch({ control, name: "brand" });
    const familyValue = useWatch({ control, name: "family" });
    const nameValue = useWatch({ control, name: "name" });

    // ======================
    // Filter families by brand
    // ======================
    const filteredFamilies = families.filter(
        (f) => f.brand === Number(brandValue)
    );

    // ======================
    // Auto slug from name
    // ======================
    useEffect(() => {
        if (nameValue) {
            const slug = nameValue.toLowerCase().replace(/\s+/g, "-");
            setValue("slug", slug);
        }
    }, [nameValue, setValue]);

    // ======================
    // Reset on open
    // ======================
    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
        } else {
            reset({
                brand: "",
                family: "",
                name: "",
                slug: "",
                is_active: true,
            });
        }
    }, [defaultValues, reset]);

    const handleFormSubmit = (data) => {
        onSubmit(data);
        reset();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>
                {defaultValues ? "Edit Model" : "Add Model"}
            </DialogTitle>

            <DialogContent>
                {/* Brand */}
                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Brand"
                    {...register("brand", { valueAsNumber: true })}
                    error={!!errors.brand}
                    helperText={errors.brand?.message}
                >
                    {brands.map((brand) => (
                        <MenuItem key={brand.id} value={brand.id}>
                            {brand.name}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Family */}
                <TextField
                    select
                    fullWidth
                    margin="normal"
                    label="Family"
                    {...register("family", { valueAsNumber: true })}
                    error={!!errors.family}
                    helperText={errors.family?.message}
                    disabled={!brandValue}
                >
                    {filteredFamilies.map((family) => (
                        <MenuItem key={family.id} value={family.id}>
                            {family.name}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Model Name */}
                <TextField
                    fullWidth
                    margin="normal"
                    label="Model Name"
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={!brandValue || !familyValue}
                />

                {/* Slug */}
                <TextField
                    fullWidth
                    margin="normal"
                    label="Slug"
                    {...register("slug")}
                    error={!!errors.slug}
                    helperText={errors.slug?.message}
                    disabled
                />

                {/* is_active */}
                <FormControlLabel
                    control={
                        <Switch
                            defaultChecked
                            {...register("is_active")}
                        />
                    }
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
