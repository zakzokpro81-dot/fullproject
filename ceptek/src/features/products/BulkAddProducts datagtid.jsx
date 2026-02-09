import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, Paper, Typography, Button, TextField, Autocomplete, 
  Container, Grid ,Stack ,IconButton
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getProductTypes, getWarehouses, getAttributes } from "./product.api";
import { BulkModelAutocomplete } from "./BulkModelAutocomplete";
import { BulkEditDrawer } from "./BulkEditDrawer";
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FlashOnIcon from '@mui/icons-material/FlashOn';

export function BulkAddProducts() {
    const { control, watch, setValue } = useForm({
        defaultValues: { sellPrice: 0, costPrice: 0, stock: 0, attributes: {}, description: "", warehouse: null }
    });

    const [rows, setRows] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const watchedCategory = watch("category");
    const watchedProductType = watch("productType");
    const watchedAttributes = watch("attributes");
    const allValues = watch();

    const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
    const { data: warehouses } = useQuery({ queryKey: ["warehouses"], queryFn: getWarehouses });
    const { data: productTypes } = useQuery({ 
        queryKey: ["productTypes", watchedCategory?.id], 
        queryFn: () => getProductTypes(watchedCategory?.id), 
        enabled: !!watchedCategory 
    });
    const { data: attributes } = useQuery({ 
        queryKey: ["attributes", watchedProductType?.id], 
        queryFn: () => getAttributes(watchedProductType?.id), 
        enabled: !!watchedProductType 
    });

    useEffect(() => { setValue("productType", null); }, [watchedCategory, setValue]);

    // --- وظيفة تتبع الحماية: تكتشف الحقل الذي تغير فعلياً فقط وتضيفه للقائمة ---
    const getUpdatedProtectionList = (oldRow, newRow) => {
        const edited = [...(oldRow.manuallyEditedFields || [])];
        
        // الحقول الأساسية
        const fields = ['sell_price', 'cost_price', 'stock', 'description', 'warehouse_name'];
        fields.forEach(f => {
            if (newRow[f] !== oldRow[f] && !edited.includes(f)) edited.push(f);
        });

        // الأتربيوتس: الحماية لكل Slug على حدة (مثلاً attr_color)
        if (newRow.attributes) {
            Object.keys(newRow.attributes).forEach(slug => {
                const key = `attr_${slug}`;
                if (newRow.attributes[slug] !== oldRow.attributes?.[slug] && !edited.includes(key)) {
                    edited.push(key);
                }
            });
        }
        return edited;
    };

    // --- زر الإجبار: يمسح حماية الحقل المحدد فقط ويطبق القيمة العلوية ---
    const applyAttributeToAll = (slug) => {
        const val = watchedAttributes?.[slug];
        const clean = (val && typeof val === "object") ? val.value : val;
        setRows((prev) => prev.map(row => ({
            ...row,
            attributes: { ...(row.attributes || {}), [slug]: clean },
            manuallyEditedFields: (row.manuallyEditedFields || []).filter(f => f !== `attr_${slug}`)
        })));
    };

    const applyFieldToAll = (fieldName) => {
        setRows((prev) => prev.map(row => {
            const up = {};
            let pKey = fieldName;
            if (fieldName === "sellPrice") { up.sell_price = Number(allValues.sellPrice); pKey = "sell_price"; }
            if (fieldName === "costPrice") { up.cost_price = Number(allValues.cost_price); pKey = "cost_price"; }
            if (fieldName === "stock") { up.stock = Number(allValues.stock); pKey = "stock"; }
            if (fieldName === "description") { up.description = allValues.description; pKey = "description"; }
            if (fieldName === "warehouse") {
                up.warehouse_name = allValues.warehouse?.name || "";
                up.warehouse_id = allValues.warehouse?.id || null;
                pKey = "warehouse_name";
            }
            return { ...row, ...up, manuallyEditedFields: (row.manuallyEditedFields || []).filter(f => f !== pKey) };
        }));
    };

    // --- التحديث التلقائي: يمر على كل حقل وكل أتربيوت ويفحص حمايته منفرداً ---
    useEffect(() => {
        if (rows.length === 0) return;
        const topAttrs = {};
        if (watchedAttributes) {
            Object.entries(watchedAttributes).forEach(([k, v]) => {
                topAttrs[k] = (v && typeof v === "object") ? v.value : v;
            });
        }

        setRows((prev) => prev.map(row => {
            const edited = row.manuallyEditedFields || [];
            const newRow = { ...row };

            // تحديث الحقول الأساسية
            if (!edited.includes("sell_price")) newRow.sell_price = Number(allValues.sellPrice);
            if (!edited.includes("cost_price")) newRow.cost_price = Number(allValues.costPrice);
            if (!edited.includes("stock")) newRow.stock = Number(allValues.stock);
            if (!edited.includes("description")) newRow.description = allValues.description || "";
            if (!edited.includes("warehouse_name")) {
                newRow.warehouse_name = allValues.warehouse?.name || "";
                newRow.warehouse_id = allValues.warehouse?.id || null;
            }

            // تحديث الأتربيوتس (حقل بحقل)
            const merged = { ...(row.attributes || {}) };
            Object.keys(topAttrs).forEach(slug => {
                if (!edited.includes(`attr_${slug}`)) {
                    merged[slug] = topAttrs[slug];
                }
            });
            newRow.attributes = merged;
            return newRow;
        }));
    }, [JSON.stringify(watchedAttributes), allValues.sellPrice, allValues.costPrice, allValues.stock, allValues.description, allValues.warehouse]);

    const handleInsertBulk = useCallback((selectedModels) => {
        const newEntries = selectedModels.map((model) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: model.label,
            part_name: watchedProductType?.name || "", 
            warehouse_name: allValues.warehouse?.name || "", 
            warehouse_id: allValues.warehouse?.id || null,   
            sell_price: Number(allValues.sellPrice) || 0,
            cost_price: Number(allValues.costPrice) || 0,
            stock: Number(allValues.stock) || 0,
            description: allValues.description || "",
            model_id: model.model_id,
            brand_id: model.brand_id,
            category_id: watchedCategory?.id,
            product_type_id: watchedProductType?.id,
            attributes: { ...allValues.attributes },
            manuallyEditedFields: [] 
        }));
        setRows((prev) => [...prev, ...newEntries]);
    }, [watchedCategory, watchedProductType, allValues]);

    const handleProcessRowUpdate = (newRow, oldRow) => {
        const edited = getUpdatedProtectionList(oldRow, newRow);
        const updated = { ...newRow, manuallyEditedFields: edited };
        setRows(prev => prev.map(r => r.id === updated.id ? updated : r));
        return updated;
    };

    const columns = [
        { field: "name", headerName: "Model", width: 250, editable: true },
        { field: "part_name", headerName: "Part Name", width: 150, sx: { bgcolor: '#f5f5f5' } },
        { field: "sell_price", headerName: "Sell Price", type: "number", width: 110, editable: true },
        { field: "cost_price", headerName: "Cost Price", type: "number", width: 110, editable: true },
        { field: "stock", headerName: "Stock", type: "number", width: 90, editable: true },
        { field: "warehouse_name", headerName: "Warehouse", width: 180, editable: true, renderEditCell: (p) => <WarehouseEditCell params={p} /> },
        {
            field: "actions",
            headerName: "Actions",
            width: 120,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                   <IconButton onClick={() => { setSelectedRow(rows.find(r => r.id === params.row.id)); setDrawerOpen(true); }} color="primary"><EditNoteIcon /></IconButton>
                    <IconButton onClick={() => setRows(prev => prev.filter(r => r.id !== params.row.id))} color="error"><DeleteIcon /></IconButton>
                </Stack>
            ),
        },
        { field: "description", headerName: "Notes", width: 180, editable: true },
    ];

    function WarehouseEditCell({ params }) {
        const { id, value, field, api } = params;
        const { data: whs = [] } = useQuery({ queryKey: ["warehouses"] });
        return (
            <Autocomplete options={whs} getOptionLabel={(o) => o.name || ""} fullWidth disableClearable
                value={whs.find(w => w.name === value) || null}
                onChange={(e, v) => {
                    api.setEditCellValue({ id, field, value: v?.name || "" });
                    api.setEditCellValue({ id, field: 'warehouse_id', value: v?.id });
                }}
                renderInput={(p) => <TextField {...p} autoFocus size="small" />}
            />
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>Mass Product Entry</Typography>
            
            <Paper sx={{ p: 3, mb: 2 }}>
                <Controller name="category" control={control} render={({ field }) => (
                    <Autocomplete {...field} options={categories || []} getOptionLabel={(o) => o?.name || ""} onChange={(e, v) => field.onChange(v)} renderInput={(p) => <TextField {...p} label="Category" margin="normal" fullWidth />} />
                )} />
                {watchedCategory && (
                    <Controller name="productType" control={control} render={({ field }) => (
                        <Autocomplete {...field} options={productTypes || []} getOptionLabel={(o) => o?.name || ""} onChange={(e, v) => field.onChange(v)} renderInput={(p) => <TextField {...p} label="Product Type" margin="normal" fullWidth />} />
                    )} />
                )}
            </Paper>

            {watchedProductType && attributes && (
                <Paper sx={{ p: 3, mb: 2, bgcolor: "#fffde7" }}>
                    <Grid container spacing={2}>
                        {attributes.map(attr => (
                            <Grid item xs={12} md={4} key={attr.id}>
                                <Stack direction="row" alignItems="center">
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Controller name={`attributes.${attr.slug}`} control={control} render={({ field }) => (
                                            attr.has_options ? (
                                                <Autocomplete options={attr.options || []} getOptionLabel={(o) => o.value} onChange={(e, v) => field.onChange(v)} renderInput={(p) => <TextField {...p} label={attr.name} margin="normal" size="small" />} />
                                            ) : (
                                                <TextField {...field} label={attr.name} margin="normal" fullWidth size="small" />
                                            )
                                        )} />
                                    </Box>
                                    <IconButton color="primary" sx={{ mt: 1 }} onClick={() => applyAttributeToAll(attr.slug)}><FlashOnIcon fontSize="small" /></IconButton>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            )}

            <Paper sx={{ p: 3, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}><Stack direction="row" alignItems="center"><Controller name="sellPrice" control={control} render={({ field }) => <TextField {...field} label="Sell Price" type="number" margin="normal" fullWidth size="small" />} /><IconButton color="primary" onClick={() => applyFieldToAll("sellPrice")} sx={{ mt: 1 }}><FlashOnIcon fontSize="small"/></IconButton></Stack></Grid>
                    <Grid item xs={12} md={3}><Stack direction="row" alignItems="center"><Controller name="costPrice" control={control} render={({ field }) => <TextField {...field} label="Cost Price" type="number" margin="normal" fullWidth size="small" />} /><IconButton color="primary" onClick={() => applyFieldToAll("costPrice")} sx={{ mt: 1 }}><FlashOnIcon fontSize="small"/></IconButton></Stack></Grid>
                    <Grid item xs={12} md={3}><Stack direction="row" alignItems="center"><Controller name="stock" control={control} render={({ field }) => <TextField {...field} label="Stock" type="number" margin="normal" fullWidth size="small" />} /><IconButton color="primary" onClick={() => applyFieldToAll("stock")} sx={{ mt: 1 }}><FlashOnIcon fontSize="small"/></IconButton></Stack></Grid>
                    <Grid item xs={12} md={3}><Stack direction="row" alignItems="center"><Controller name="description" control={control} render={({ field }) => <TextField {...field} label="Notes" margin="normal" fullWidth size="small" />} /><IconButton color="primary" onClick={() => applyFieldToAll("description")} sx={{ mt: 1 }}><FlashOnIcon fontSize="small"/></IconButton></Stack></Grid>
                    <Grid item xs={12}><Stack direction="row" alignItems="center"><Box sx={{ flexGrow: 1 }}><Controller name="warehouse" control={control} render={({ field }) => (<Autocomplete {...field} options={warehouses || []} getOptionLabel={(o) => o.name || ""} onChange={(e, v) => field.onChange(v)} renderInput={(p) => <TextField {...p} label="Warehouse" margin="normal" fullWidth size="small" />} />)} /></Box><IconButton color="primary" onClick={() => applyFieldToAll("warehouse")} sx={{ mt: 1, ml: 1 }}><FlashOnIcon fontSize="small"/></IconButton></Stack></Grid>
                </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: "#f0f7ff", border: "1px solid #c2e0ff", borderRadius: "12px" }}>
                <BulkModelAutocomplete disabled={!watchedProductType} onSelectBulk={handleInsertBulk} />
            </Paper>

            <Box sx={{ height: 500, mb: 2, bgcolor: 'white', boxShadow: 2, borderRadius: 2 }}>
                <DataGrid rows={rows} columns={columns}
                    onCellClick={(p) => { if (p.isEditable) p.api.startCellEditMode({ id: p.id, field: p.field }); }}
                    slotProps={{ cell: { onFocus: (e) => { const input = e.currentTarget.querySelector('input'); if (input) input.select(); } } }}
                    processRowUpdate={handleProcessRowUpdate}
                    experimentalFeatures={{ newEditingApi: true }}
                    sx={{ '& .MuiDataGrid-cell--editable': { cursor: 'text' } }}
                />
            </Box>

            <Button variant="contained" color="success" fullWidth size="large" sx={{ py: 2 }} onClick={() => console.log(rows)}>
                Save All ({rows.length})
            </Button>

            {selectedRow && (
                <BulkEditDrawer 
                    open={drawerOpen} onClose={() => setDrawerOpen(false)} 
                    product={rows.find(r => r.id === selectedRow.id)} 
                    onUpdate={(updated) => {
                        setRows(prev => prev.map(old => {
                            if (old.id !== updated.id) return old;
                            // هنا يتم فحص كل حقل وأتربيوت بشكل مستقل تماماً
                            const newEditedList = getUpdatedProtectionList(old, updated);
                            return { ...updated, manuallyEditedFields: newEditedList };
                        }));
                    }}
                />
            )}
        </Container>
    );
}