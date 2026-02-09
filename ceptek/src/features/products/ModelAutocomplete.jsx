import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import supabase from "../../config/supabase";

// normalize Turkish characters
function normalizeText(text) {
    const map = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u" };
    return text.toLowerCase().replace(/[çğıİöşü]/g, (m) => map[m]);
}

export function ModelAutocomplete({ value, onChange, label = "Select Model" }) {
    const { data: models = [], isLoading } = useQuery({
        queryKey: ["models-for-products"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("models")
                .select(`
                    id, name,
                    families(id, name, brands(id, name))
                `)
                .eq("is_active", true);

            if (error) throw error;
            return data;
        },
        enabled: true,
    });

    const modelOptions = models.map((m) => ({
        label: `${m.families?.brands?.name} ${m.families?.name} ${m.name}`,
        brand_id: m.families?.brands?.id,
        family_id: m.families?.id,
        model_id: m.id,
        model_name: m.name,
    }));

    return (
        <Autocomplete 
           
            options={modelOptions}
            value={value || null} // قيمة الفورم
            onChange={(e, val) => onChange(val)} // تحديث الفورم
            getOptionLabel={(option) => option?.label || ""}
            isOptionEqualToValue={(option, val) => option.model_id === val?.model_id}
            filterOptions={(opts, state) => {
                const input = normalizeText(state.inputValue);
                return opts.filter((o) => normalizeText(o.label).includes(input));
            }}
            loading={isLoading}
            renderInput={(params) => (
                <TextField
                 sx={{color:"#d21994",  backgroundColor:"#e2e8ee",}}
                   
                    {...params}
                    label={label}
                    margin="normal"
                    fullWidth
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
}
