import { useState, useMemo } from "react";
import {
  Autocomplete,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import supabase from "../../config/supabase";

// Normalize Turkish characters to standard Latin for search matching
function normalizeText(text) {
  if (!text) return "";
  const map = {
    ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", I: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return text.replace(/[çğıİöşüÇĞIÖŞÜ]/g, (m) => map[m]).toLowerCase();
}

export function BulkModelAutocomplete({
  onSelectBulk,
  disabled,
  selectedCategory,
  selectedProductType,
}) {
  const [inputValue, setInputValue] = useState("");

  const { data: models = [], isLoading } = useQuery({
    queryKey: [
      "models-for-bulk",
      selectedCategory?.id,
      selectedProductType?.id,
    ],
    queryFn: async () => {
      if (!selectedCategory?.id) return [];

      // Fetch from model_full_tree view
      let query = supabase
        .from("model_full_tree")
        .select("*");

      // Dynamic filter logic
      if (!selectedCategory.show_all_models) {
        if (selectedProductType?.id) {
          query = query.eq("product_type_id", selectedProductType.id);
        } else {
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCategory?.id,
  });

  // Map view fields to option shape
  const modelOptions = useMemo(() => {
    return models.map((m) => ({
      label:
        `${m.brand_name || ""} ${m.family_name || ""} ${m.model_name || ""}`.trim(),
      brand_id: m.brand_id,
      family_id: m.family_id,
      model_id: m.model_id,
    }));
  }, [models]);

  // Custom filter supporting Turkish + Latin character search
  const filterOptions = (options, { inputValue }) => {
    const normalizedInput = normalizeText(inputValue);
    return options.filter((option) =>
      normalizeText(option.label).includes(normalizedInput),
    );
  };

  const filteredResults = useMemo(() => {
    const search = normalizeText(inputValue);
    if (!search) return [];
    return modelOptions.filter((o) => normalizeText(o.label).includes(search));
  }, [inputValue, modelOptions]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        width: "100%",
      }}
    >
      {/* Model search autocomplete */}
      <Box sx={{ flexGrow: 1 }}>
        <Autocomplete
          disabled={disabled}
          options={modelOptions}
          inputValue={inputValue}
          onInputChange={(e, val) => setInputValue(val)}
          filterOptions={filterOptions}
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
              size="medium"
              placeholder="e.g., iPhone 13"
            />
          )}
        />
      </Box>

      {/* Insert all matching results */}
      <Button
        variant="contained"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (filteredResults.length > 0) {
            onSelectBulk(filteredResults);
            setInputValue("");
          }
        }}
        disabled={disabled || filteredResults.length === 0}
        sx={{
          height: "56px",
          minWidth: "180px",
          fontWeight: "bold",
          borderRadius: "8px",
          background: "linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)",
          color: "white",
          boxShadow: "0 3px 5px 2px rgba(76, 175, 80, .3)",
          textTransform: "none",
          "&:hover": {
            background: "linear-gradient(45deg, #1b5e20 30%, #388e3c 90%)",
          },
        }}
      >
        Insert All ({filteredResults.length})
      </Button>
    </Box>
  );
}
