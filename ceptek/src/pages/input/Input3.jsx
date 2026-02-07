import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, Typography, Box } from "@mui/material";
import supabase from "../../config/supabase";

export function Input({ onSelect }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // جلب البيانات من جميع الجداول
    useEffect(() => {
        const fetchData = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);

            const { data: brands, error } = await supabase
                .from("brands")
                .select(`
          id,
          name,
          families (
            id,
            name,
            models (
              id,
              name,
              code_number
            )
          )
        `);

            setLoading(false);

            if (error) {
                console.log("Supabase error:", error);
                return;
            }

            // معالجة البيانات لتصبح مصفوفة مسطحة لجميع الموديلات
            const tempResults = [];
            brands.forEach(brand => {
                brand.families.forEach(family => {
                    family.models.forEach(model => {
                        // البحث النصي هنا على مستوى JS
                        if (model.name.toLowerCase().includes(query.toLowerCase())) {
                            tempResults.push({
                                model_id: model.id,
                                model_name: model.name,
                                code_number: model.code_number,
                                family_id: family.id,
                                family_name: family.name,
                                brand_id: brand.id,
                                brand_name: brand.name,
                            });
                        }
                    });
                });
            });

            setResults(tempResults);
        };

        fetchData();
    }, [query]);

    return (
        <Autocomplete
            options={results}
            loading={loading}
            getOptionLabel={(option) => option.model_name}
            filterOptions={(x) => x} // منع فلترة MUI الداخلية
            onInputChange={(e, value) => setQuery(value)}
            onChange={(e, value) => {
                if (value) {
                    // تمرير البيانات للمكون الأب أو استخدامها مباشرة
                    if (onSelect) {
                        onSelect({
                            model_id: value.model_id,
                            family_id: value.family_id,
                            brand_id: value.brand_id,
                        });
                    }
                    console.log("اختيار الموديل:", value.model_name);
                    console.log("Brand:", value.brand_name);
                    console.log("Family:", value.family_name);
                }
            }}
            renderOption={(props, option) => (
                <Box component="li" {...props}>
                    <Typography sx={{ fontWeight: "bold", mr: 1 }}>{option.model_name}</Typography>
                    <Typography sx={{ color: "gray" }}>
                        ({option.brand_name} / {option.family_name})
                    </Typography>
                </Box>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="ابحث عن الموديل"
                    variant="outlined"
                    placeholder="أدخل اسم الموديل"
                />
            )}
            noOptionsText="لا يوجد نتائج"
        />
    );
}
