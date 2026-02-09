import React, { useEffect, useState } from "react";
import {
    Drawer, Box, Stack, Typography, IconButton, Divider, Paper,
    TextField, Autocomplete, Button, List, ListItem, CircularProgress, FormControlLabel, Switch
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getAttributes } from "./product.api";

export function BulkEditDrawer({ open, onClose, product, onUpdate }) {
    const [isReady, setIsReady] = useState(false);

    const { control, handleSubmit, setValue, reset } = useForm({
        defaultValues: { attributes: {}, description: "" }
    });

    const { data: attributes, isLoading: loadingAttr } = useQuery({
        queryKey: ["attributes", product?.product_type_id],
        queryFn: () => getAttributes(product?.product_type_id),
        enabled: !!product?.product_type_id && open,
    });

    useEffect(() => {
        if (!open || !product || !attributes) return;

        const currentAttributes = {};

        attributes.forEach(attr => {
            const rawValue = product.attributes?.[attr.slug];
            const cleanValue = (rawValue && typeof rawValue === "object")
                ? rawValue.value
                : rawValue;

            if (attr.has_options && attr.options) {
                currentAttributes[attr.slug] =
                    attr.options.find(o => o.value === cleanValue) || null;
            } else {
                currentAttributes[attr.slug] = cleanValue || "";
            }
        });

        reset({
            description: product.description || "",
            is_active: product.is_active === undefined ? true : Boolean(product.is_active),
            attributes: currentAttributes
        });

    }, [open, product, attributes, reset]);

    const onSubmit = (data) => {
        const formattedAttributes = {};
        if (data.attributes) {
            Object.keys(data.attributes).forEach((key) => {
                const val = data.attributes[key];
                formattedAttributes[key] = (val && typeof val === "object") ? val.value : val;
            });
        }

        onUpdate({
            ...product,
            description: data.description,
            is_active: data.is_active ? 1 : 0,
            attributes: formattedAttributes
        });
        onClose();
    };

    if (!product) return null;

    return (
        <Drawer
            key={product?.id}   // ← هذا هو السطر الحاسم
            anchor="right"
            open={open}
            onClose={onClose}
        >
            <Box sx={{ width: 420, p: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">Edit Specifications</Typography>
                    <IconButton onClick={onClose} color="error"><CloseIcon /></IconButton>
                </Stack>
                <Divider sx={{ mb: 2 }} />

                { loadingAttr ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>
                ) : (
                    <Box>
                        <Typography variant="caption" color="textSecondary">Model</Typography>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>{product.name}</Typography>

                        <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                            <List disablePadding>
                                {attributes?.map((attr) => (
                                    <ListItem key={attr.id} disableGutters sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
                                        <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5 }}>{attr.name}</Typography>
                                        <Controller
                                            name={`attributes.${attr.slug}`}
                                            control={control}
                                            render={({ field }) => (
                                                attr.has_options ? (
                                                    <Autocomplete
                                                        {...field}
                                                        options={attr.options || []}
                                                        getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.value || "")}
                                                        size="small"
                                                        fullWidth
                                                        value={attr.options?.find(o => o.value === (field.value?.value || field.value)) || field.value || null}
                                                        onChange={(_, val) => field.onChange(val)}
                                                        renderInput={(params) => <TextField {...params} variant="outlined" sx={{ bgcolor: 'white' }} />}
                                                    />
                                                ) : (
                                                    <TextField {...field} size="small" fullWidth variant="outlined" sx={{ bgcolor: 'white' }} value={field.value || ""} />
                                                )
                                            )}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: '#f0f4f8', borderRadius: 2 }}>
                            <Controller
                                name="is_active"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={!!field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label={<Typography variant="body2" fontWeight="bold">Active Status</Typography>}
                                    />
                                )}
                            />
                        </Paper>

                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>Description</Typography>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} multiline rows={3} fullWidth variant="outlined" sx={{ bgcolor: "#f5f5f5" }} value={field.value || ""} />
                                )}
                            />
                        </Box>

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSubmit(onSubmit)}
                            sx={{ mt: 4, py: 1.5, fontWeight: 'bold' }}
                        >
                            Update Model Row
                        </Button>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
}
