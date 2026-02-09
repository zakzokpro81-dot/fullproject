import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, Paper, Typography, Button, TextField, Autocomplete, 
  Container, Grid, Stack, IconButton, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Collapse, Divider 
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getProductTypes, getWarehouses, getAttributes } from "./product.api";
import { BulkModelAutocomplete } from "./BulkModelAutocomplete";
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// --- مكون السطر القابل للطي (يجمع بين سطر الجدول والدراور السابق) ---
function Row({ row, warehouses, attributesList, onRowUpdate, onDelete }) {
    const [open, setOpen] = useState(false);

    // دالة لتحديث أي حقل وتمريره للدالة الأصلية لتفعيل الحماية
    const handleChange = (field, value) => {
        onRowUpdate({ ...row, [field]: value }, row);
    };

    const handleAttrChange = (slug, value) => {
        const updatedAttrs = { ...(row.attributes || {}), [slug]: value };
        onRowUpdate({ ...row, attributes: updatedAttrs }, row);
    };

    return (
        <React.Fragment>
            {/* السطر الأساسي (نفس حقول الداتاغريد الأصلي) */}
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell width="50">
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.part_name}</TableCell>
                <TableCell align="right">{row.sell_price}</TableCell>
                <TableCell align="right">{row.cost_price}</TableCell>
                <TableCell align="right">{row.stock}</TableCell>
                <TableCell>{row.warehouse_name}</TableCell>
                <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton size="small" onClick={() => setOpen(!open)} color="primary"><EditNoteIcon /></IconButton>
                        <IconButton size="small" onClick={() => onDelete(row.id)} color="error"><DeleteIcon /></IconButton>
                    </Stack>
                </TableCell>
            </TableRow>

            {/* السطر الفرعي (يحتوي على كامل بيانات الدراور السابق) */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, p: 3, bgcolor: '#f9f9f9', borderRadius: 2, border: '1px solid #ddd' }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">Product Details & Attributes</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField label="Model Name" fullWidth size="small" value={row.name || ""} 
                                        onChange={(e) => handleChange('name', e.target.value)} />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField label="Sell Price" type="number" fullWidth size="small" value={row.sell_price || 0} 
                                        onChange={(e) => handleChange('sell_price', Number(e.target.value))} />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField label="Cost Price" type="number" fullWidth size="small" value={row.cost_price || 0} 
                                        onChange={(e) => handleChange('cost_price', Number(e.target.value))} />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField label="Stock" type="number" fullWidth size="small" value={row.stock || 0} 
                                        onChange={(e) => handleChange('stock', Number(e.target.value))} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Autocomplete options={warehouses || []} getOptionLabel={(o) => o.name || ""}
                                        value={warehouses?.find(w => w.id === row.warehouse_id) || null}
                                        onChange={(e, v) => {
                                            onRowUpdate({ ...row, warehouse_name: v?.name || "", warehouse_id: v?.id || null }, row);
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Warehouse" size="small" />}
                                    />
                                </Grid>

                                <Grid item xs={12}><Divider sx={{ my: 1 }}><Typography variant="caption" color="textSecondary">Attributes</Typography></Divider></Grid>
                                {attributesList?.map(attr => (
                                    <Grid item xs={12} md={4} key={attr.id} sx={{flexGrow:1 ,flexDirection: { xs: "clumon", sm: "row" }}}>
                                        {attr.has_options ? (
                                            <Autocomplete size="small" options={attr.options || []} getOptionLabel={(o) => o.value || ""}
                                                value={attr.options?.find(opt => opt.value === row.attributes?.[attr.slug]) || null}
                                                onChange={(e, v) => handleAttrChange(attr.slug, v?.value || "")}
                                                renderInput={(params) => <TextField {...params} label={attr.name} size="small" />}
                                            />
                                        ) : (
                                            <TextField label={attr.name} fullWidth size="small" value={row.attributes?.[attr.slug] || ""}
                                                onChange={(e) => handleAttrChange(attr.slug, e.target.value)} />
                                        )}
                                    </Grid>
                                ))}
                                <Grid item xs={12}>
                                    <TextField label="Notes" fullWidth multiline rows={2} size="small" value={row.description || ""}
                                        onChange={(e) => handleChange('description', e.target.value)} />
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export function BulkAddProducts() {
    const { control, watch, setValue } = useForm({
        defaultValues: { sellPrice: 0, costPrice: 0, stock: 0, attributes: {}, description: "", warehouse: null }
    });

    const [rows, setRows] = useState([]);

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

    const getUpdatedProtectionList = (oldRow, newRow) => {
        const edited = [...(oldRow.manuallyEditedFields || [])];
        const fields = ['sell_price', 'cost_price', 'stock', 'description', 'warehouse_name'];
        fields.forEach(f => {
            if (newRow[f] !== oldRow[f] && !edited.includes(f)) edited.push(f);
        });
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
            if (fieldName === "costPrice") { up.cost_price = Number(allValues.costPrice); pKey = "cost_price"; }
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
            if (!edited.includes("sell_price")) newRow.sell_price = Number(allValues.sellPrice);
            if (!edited.includes("cost_price")) newRow.cost_price = Number(allValues.costPrice);
            if (!edited.includes("stock")) newRow.stock = Number(allValues.stock);
            if (!edited.includes("description")) newRow.description = allValues.description || "";
            if (!edited.includes("warehouse_name")) {
                newRow.warehouse_name = allValues.warehouse?.name || "";
                newRow.warehouse_id = allValues.warehouse?.id || null;
            }
            const merged = { ...(row.attributes || {}) };
            Object.keys(topAttrs).forEach(slug => {
                if (!edited.includes(`attr_${slug}`)) merged[slug] = topAttrs[slug];
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
                <Paper sx={{ p: 3, mb: 2, flexDirection: { xs: "clumon", sm: "row" },
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,}}>
                    <Grid container spacing={2} >
                        {attributes.map(attr => (
                            <Grid item xs={12} md={4} key={attr.id}  sx={{ flexGrow: 1 }}>
                                <Stack direction="row" alignItems="center" >
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

            <TableContainer component={Paper} sx={{ mb: 2, maxHeight: 600 }}>
                <Table stickyHeader aria-label="collapsible table">
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#eee' }}>
                            <TableCell width="50" />
                            <TableCell>Model</TableCell>
                            <TableCell>Part Name</TableCell>
                            <TableCell align="right">Sell Price</TableCell>
                            <TableCell align="right">Cost Price</TableCell>
                            <TableCell align="right">Stock</TableCell>
                            <TableCell>Warehouse</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <Row 
                                key={row.id} 
                                row={row} 
                                warehouses={warehouses} 
                                attributesList={attributes} 
                                onRowUpdate={handleProcessRowUpdate} 
                                onDelete={(id) => setRows(prev => prev.filter(r => r.id !== id))} 
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Button variant="contained" color="success" fullWidth size="large" sx={{ py: 2 }} onClick={() => console.log(rows)}>
                Save All ({rows.length})
            </Button>
        </Container>
    );
}