import React, { useState, useMemo } from "react";
import { Autocomplete, TextField, Button, Grid, createFilterOptions } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import supabase from "../../config/supabase";

// دالة تحويل الأحرف التركية إلى أحرف لاتينية قياسية
function normalizeText(text) {
    if (!text) return "";
    const map = { 
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'I': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' 
    };
    return text.replace(/[çğıİöşüÇĞIÖŞÜ]/g, (m) => map[m]).toLowerCase();
}

export function BulkModelAutocomplete({ onSelectBulk, disabled }) {
    const [inputValue, setInputValue] = useState("");

    const { data: models = [] } = useQuery({
        queryKey: ["models-for-bulk"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("models")
                .select(`id, name, families(id, name, brands(id, name))`)
                .eq("is_active", true);
            if (error) throw error;
            return data;
        },
    });

    const modelOptions = useMemo(() => models.map((m) => ({
        label: `${m.families?.brands?.name || ""} ${m.families?.name || ""} ${m.name || ""}`,
        brand_id: m.families?.brands?.id,
        family_id: m.families?.id,
        model_id: m.id,
    })), [models]);

    // تخصيص الفلتر ليدعم البحث بالأحرف التركية واللاتينية معاً
    const filterOptions = (options, { inputValue }) => {
        const normalizedInput = normalizeText(inputValue);
        return options.filter((option) => 
            normalizeText(option.label).includes(normalizedInput)
        );
    };

    const filteredResults = useMemo(() => {
        const search = normalizeText(inputValue);
        if (!search) return [];
        return modelOptions.filter(o => normalizeText(o.label).includes(search));
    }, [inputValue, modelOptions]);

    return (
        <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={9}>
                <Autocomplete
                    disabled={disabled}
                    options={modelOptions}
                    inputValue={inputValue}
                    onInputChange={(e, val) => setInputValue(val)}
                    filterOptions={filterOptions} // التعديل الجوهري هنا
                    getOptionLabel={(option) => option.label || ""}
                    onChange={(e, newValue) => {
                        if (newValue) {
                            onSelectBulk([newValue]);
                            setInputValue("");
                        }
                    }}
                    renderInput={(params) => (
                        <TextField 
                            {...params} 
                            label="Search Models..." 
                            fullWidth 
                            variant="outlined"
                            placeholder="e.g., iPhone 13"
                        />
                    )}
                />
            </Grid>

            <Grid item xs={12} md={3}>
                <Button 
                    variant="contained" 
                    fullWidth
                    onMouseDown={(e) => e.preventDefault()} 
                    onClick={() => {
                        if (filteredResults.length > 0) {
                            onSelectBulk(filteredResults);
                            setInputValue("");
                        }
                    }}
                    disabled={disabled || filteredResults.length === 0}
                    sx={{ 
                        height: '56px', 
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                        boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                        textTransform: 'none'
                    }}
                >
                    Insert All ({filteredResults.length})
                </Button>
            </Grid>
        </Grid>
    );
}