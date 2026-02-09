import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, Paper, Typography, Button, TextField, Autocomplete, 
  Container, Stack, IconButton, InputAdornment, Tooltip
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getProductTypes, getWarehouses, getAttributes } from "./product.api";
import { BulkModelAutocomplete } from "./BulkModelAutocomplete";
import FlashOnIcon from '@mui/icons-material/FlashOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import BulkProductTable from "./BulkProductTable";

// توحيد نمط جميع الأقسام (Paper)
const SECTION_STYLE = {
  p: 3, 
  borderRadius: 2, 
  border: "1px solid", 
  borderColor: "divider",
  boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
  bgcolor: "background.paper",
  width: "100%", 
};

// توحيد تنسيق الحقول لتبدو متناسقة في جميع الصفوف
const FIELD_PROPS = {
  fullWidth: true,
  size: "small",
  variant: "outlined"
};

export function BulkAddProducts() {
    const { control, watch, setValue } = useForm({
        defaultValues: { sellPrice: 0, costPrice: 0, stock: 0, attributes: {}, description: "", warehouse: null }
    });

    const [rows, setRows] = useState([]);
    const watchedCategory = watch("category");
    const watchedProductType = watch("productType");
    const watchedAttributes = watch("attributes");
    const allValues = watch();

    // Queries
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

    // Logic Functions (تطبيق القيم على الكل)
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

    const handleInsertBulk = useCallback((selectedModels) => {
        const newEntries = selectedModels.map((model) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: model.label,
            part_name: watchedProductType?.name || "", 
            warehouse_name: allValues.warehouse?.name || "", 
            sell_price: Number(allValues.sellPrice) || 0,
            cost_price: Number(allValues.costPrice) || 0,
            stock: Number(allValues.stock) || 0,
            attributes: { ...allValues.attributes },
            manuallyEditedFields: [] 
        }));
        setRows((prev) => [...prev, ...newEntries]);
    }, [watchedCategory, watchedProductType, allValues]);

    return (
        <Container maxWidth="xl" sx={{ py: 6, backgroundColor: "#fcfcfd", minHeight: "100vh" }}>
            
            {/* 1. Header Section */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="800" letterSpacing="-0.5px">Mass Entry Portal</Typography>
                    <Typography color="text.secondary" variant="body2">Streamline your inventory management efficiently</Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, color: "primary.main", opacity: 0.8 }} />
            </Stack>

            {/* Main Wrapper: Stack يضمن عرض كامل وفجوات متساوية */}
            <Stack spacing={3}>
                
                {/* 1. Classification القسم الأول */}
                <Paper sx={SECTION_STYLE}>
                    <Typography variant="subtitle1" fontWeight="bold" mb={2.5}>1. Classification</Typography>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                        <Controller name="category" control={control} render={({ field }) => (
                            <Autocomplete {...field} options={categories || []} getOptionLabel={(o) => o?.name || ""} onChange={(e, v) => field.onChange(v)} 
                                renderInput={(p) => <TextField {...p} {...FIELD_PROPS} label="Main Category" />} 
                            />
                        )} />
                        <Controller name="productType" control={control} render={({ field }) => (
                            <Autocomplete {...field} disabled={!watchedCategory} options={productTypes || []} getOptionLabel={(o) => o?.name || ""} onChange={(e, v) => field.onChange(v)} 
                                renderInput={(p) => <TextField {...p} {...FIELD_PROPS} label="Product Type" />} 
                            />
                        )} />
                    </Stack>
                </Paper>

                {/* 2. Bulk Model Selection القسم الثاني */}
                <Paper sx={SECTION_STYLE}>
                    <Typography variant="subtitle1" fontWeight="bold" mb={2.5}>2. Bulk Model Selection</Typography>
                    <Box>
                        <BulkModelAutocomplete disabled={!watchedProductType} onSelectBulk={handleInsertBulk} />
                    </Box>
                </Paper>

                {/* 3. Universal Product Values القسم الثالث */}
                <Paper sx={SECTION_STYLE}>
                    <Typography variant="subtitle1" fontWeight="bold" mb={3}>3. Universal Product Values</Typography>
                    <Stack spacing={2.5}>
                        {/* صف الأسعار والمخزون */}
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            {[
                                { name: "sellPrice", label: "Selling Price", type: "number" },
                                { name: "costPrice", label: "Cost Price", type: "number" },
                                { name: "stock", label: "Opening Stock", type: "number" }
                            ].map((fInfo) => (
                                <Controller key={fInfo.name} name={fInfo.name} control={control} render={({ field }) => (
                                    <TextField {...field} {...FIELD_PROPS} label={fInfo.label} type={fInfo.type} 
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" color="primary" onClick={() => applyFieldToAll(fInfo.name)}><FlashOnIcon fontSize="small" /></IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )} />
                            ))}
                        </Stack>
                        
                        {/* صف المستودع والملاحظات */}
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <Box sx={{ flex: 1 }}>
                                <Controller name="warehouse" control={control} render={({ field }) => (
                                    <Autocomplete {...field} options={warehouses || []} getOptionLabel={(o) => o.name || ""} onChange={(e, v) => field.onChange(v)} 
                                        renderInput={(p) => <TextField {...p} {...FIELD_PROPS} label="Target Warehouse" 
                                            InputProps={{ ...p.InputProps, endAdornment: (
                                                <React.Fragment>
                                                    {p.InputProps.endAdornment}
                                                    <InputAdornment position="end"><IconButton size="small" color="primary" onClick={() => applyFieldToAll("warehouse")}><FlashOnIcon fontSize="small" /></IconButton></InputAdornment>
                                                </React.Fragment>
                                            )}}
                                        />} 
                                    />
                                )} />
                            </Box>
                            <Box sx={{ flex: 2 }}>
                                <Controller name="description" control={control} render={({ field }) => (
                                    <TextField {...field} {...FIELD_PROPS} label="General Notes" 
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end"><IconButton size="small" color="primary" onClick={() => applyFieldToAll("description")}><FlashOnIcon fontSize="small" /></IconButton></InputAdornment>
                                            ),
                                        }}
                                    />
                                )} />
                            </Box>
                        </Stack>
                    </Stack>
                </Paper>

                {/* 4. Specification Overrides القسم الرابع */}
                {watchedProductType && attributes && (
                    <Paper sx={SECTION_STYLE}>
                        <Typography variant="subtitle1" fontWeight="bold" mb={3}>4. Specification Overrides</Typography>
                        {/* Box مع flexWrap لمحاكاة الـ Grid بدون مشاكله */}
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                            {attributes.map(attr => (
                                <Box key={attr.id} sx={{ width: { xs: "100%", sm: "calc(50% - 16px)", md: "calc(25% - 16px)" } }}>
                                    <Controller name={`attributes.${attr.slug}`} control={control} render={({ field }) => (
                                        attr.has_options ? (
                                            <Autocomplete options={attr.options || []} getOptionLabel={(o) => o.value} onChange={(e, v) => field.onChange(v)} 
                                                renderInput={(p) => <TextField {...p} {...FIELD_PROPS} label={attr.name} 
                                                    InputProps={{ ...p.InputProps, endAdornment: (
                                                        <React.Fragment>
                                                            {p.InputProps.endAdornment}
                                                            <InputAdornment position="end"><IconButton size="small" color="primary" onClick={() => applyAttributeToAll(attr.slug)}><FlashOnIcon fontSize="small" /></IconButton></InputAdornment>
                                                        </React.Fragment>
                                                    )}} 
                                                />} 
                                            />
                                        ) : (
                                            <TextField {...field} {...FIELD_PROPS} label={attr.name} 
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end"><IconButton size="small" color="primary" onClick={() => applyAttributeToAll(attr.slug)}><FlashOnIcon fontSize="small" /></IconButton></InputAdornment>
                                                    ),
                                                }}
                                            />
                                        )
                                    )} />
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                )}

                {/* 5. Table Section القسم الأخير (الجدول) */}
                <Box>
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                        <BulkProductTable rows={rows} warehouses={warehouses} attributes={attributes} onRowUpdate={(n) => setRows(prev => prev.map(r => r.id === n.id ? n : r))} setRows={setRows} />
                    </Paper>
                </Box>
            </Stack>

            {/* Sticky Save Button */}
            <Box sx={{ position: "sticky", bottom: 24, mt: 4, display: "flex", justifyContent: "center", zIndex: 10 }}>
                <Button variant="contained" size="large" disabled={rows.length === 0}
                    sx={{ px: 10, py: 2, borderRadius: 50, fontWeight: "bold", textTransform: "none", boxShadow: "0px 10px 20px rgba(25, 118, 210, 0.3)" }} 
                    onClick={() => console.log(rows)}
                >
                    Save All {rows.length > 0 && `(${rows.length} Items)`}
                </Button>
            </Box>
        </Container>
    );
}