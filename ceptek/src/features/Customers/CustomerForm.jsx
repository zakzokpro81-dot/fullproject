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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../../config/supabase";

export default function CustomerForm({ open, onClose, editRow }) {
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            store_name: "",
            email: "",
            phone: "",
            address: "",
            customer_type_id: null,
        },
    });

    // fetch customer types
    const { data: customerTypes = [], isLoading: loadingTypes } = useQuery({
        queryKey: ["customer_types"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("customer_types")
                .select("id, type_name")
                .order("type_name");
            if (error) throw error;
            return data;
        },
    });

    // mutation
    const mutation = useMutation({
        mutationFn: async (formData) => {
            if (editRow) {
                const { error } = await supabase
                    .from("customers")
                    .update(formData)
                    .eq("id", editRow.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from("customers").insert(formData);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["customers"]);
            onClose();
            reset();
        },
    });

    useEffect(() => {
        if (editRow) {
            reset({
                name: editRow.name || "",
                store_name: editRow.store_name || "",
                email: editRow.email || "",
                phone: editRow.phone || "",
                address: editRow.address || "",
                customer_type_id: editRow.customer_type_id || null,
            });
        } else {
            reset({
                name: "",
                store_name: "",
                email: "",
                phone: "",
                address: "",
                customer_type_id: null,
            });
        }
    }, [editRow, reset]);

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {editRow ? "Edit Customer" : "Add Customer"}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <Controller
                        name="name"
                        control={control}
                        rules={{ required: "Name is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Name"
                                error={!!errors.name}
                                helperText={errors.name?.message}
                                fullWidth
                            />
                        )}
                    />

                    <Controller
                        name="store_name"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Store Name" fullWidth />
                        )}
                    />

                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Email" fullWidth />
                        )}
                    />

                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Phone" fullWidth />
                        )}
                    />

                    <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Address" fullWidth />
                        )}
                    />

                    {/* Customer Type */}
                    <Controller
                        name="customer_type_id"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                options={customerTypes}
                                loading={loadingTypes}
                                getOptionLabel={(option) => option?.type_name || ""}
                                value={
                                    customerTypes.find((t) => t.id === field.value) || null
                                }
                                onChange={(e, newValue) =>
                                    field.onChange(newValue ? newValue.id : null)
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Customer Type"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingTypes ? (
                                                        <CircularProgress size={20} />
                                                    ) : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        )}
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    variant="contained"
                    disabled={mutation.isLoading}
                >
                    {editRow ? "Update" : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
