import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import supabase from "../../config/supabase";

// normalize Turkish characters
function normalizeText(text) {
  const map = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u" };
  return text.toLowerCase().replace(/[çğıİöşü]/g, (m) => map[m]);
}

export function ModelAutocomplete({
  value,
  onChange,
  label = "Select Model",
  selectedCategory,
  selectedProductType,
}) {
  const { data: models = [], isLoading } = useQuery({
    // Query key depends on category and product type to refetch on change
    queryKey: [
      "models-for-products",
      selectedCategory?.id,
      selectedProductType?.id,
    ],
    queryFn: async () => {
      // If no category selected, show no models
      if (!selectedCategory?.id) return [];

      let query = supabase
        .from("models")
        .select(
          `
                    id, name,
                    families!inner(id, name, product_type_id, brands(id, name))
                `,
        )
        .eq("is_active", true);

      // Dynamic filter logic:
      // If category doesn't support showing all (show_all_models = false)
      if (!selectedCategory.show_all_models) {
        if (selectedProductType?.id) {
          // Filter by selected product type
          query = query.eq("families.product_type_id", selectedProductType.id);
        } else {
          // Category requires a type but none selected yet
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCategory?.id, // Only run when a category is selected
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
      value={value || null} // Form value
      onChange={(e, val) => onChange(val)} // Update form
      getOptionLabel={(option) => option?.label || ""}
      isOptionEqualToValue={(option, val) => option.model_id === val?.model_id}
      filterOptions={(opts, state) => {
        const input = normalizeText(state.inputValue);
        return opts.filter((o) => normalizeText(o.label).includes(input));
      }}
      loading={isLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          margin="normal"
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
