import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Autocomplete,
  MenuItem,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "./product.schema";
import { useQuery } from "@tanstack/react-query";
import supabase from "../../config/supabase";
import { useEffect, useState } from "react";

// normalize Turkish characters
function normalizeText(text) {
  const map = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u" };
  return text.toLowerCase().replace(/[çğıİöşü]/g, (m) => map[m]);
}

export default function ProductForm({ open, onClose, onSubmit, defaultValues }) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_type: "",
      part_type_id: "",
      model_id: "",
      name: "",
      sell_price: 0,
      cost_price: 0,
      stock: 0,
      is_active: true,
      description: "",
      warehouse_id: "",
      attributes: {}, // object ديناميكي لتخزين القيم
    },
  });

  // Watchers
  const selectedProductType = watch("product_type");
  const selectedPartTypeId = watch("part_type_id");
  const selectedModelId = watch("model_id");

  // Data States
  const { data: productTypes = [] } = useQuery({
    queryKey: ["product-types"],
    queryFn: async () => {
      return [
        { id: "spare_part", name: "Spare Part" },
        { id: "accessory", name: "Accessory" },
        { id: "electronics", name: "Electronics" },
      ];
    },
  });

  const { data: partTypes = [] } = useQuery({
    queryKey: ["part-types", selectedProductType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("part_types")
        .select("*")
        .eq("product_type", selectedProductType)
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedProductType,
  });

  const { data: models = [] } = useQuery({
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
    enabled: selectedProductType === "spare_part",
  });

  const { data: attributes = [] } = useQuery({
    queryKey: ["attributes", selectedPartTypeId],
    queryFn: async () => {
      if (!selectedPartTypeId) return [];
      const { data, error } = await supabase
        .from("product_attributes")
        .select("id, name")
        .eq("part_type_id", selectedPartTypeId);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPartTypeId,
  });

  const { data: warehouses = [], isLoading: warehousesLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("warehouses")
        .select("id, name")
        .eq("is_active", true)
        .order("id", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const [inputValue, setInputValue] = useState("");

  const modelOptions = models.map((m) => ({
    label: `${m.families?.brands?.name} ${m.families?.name} ${m.name}`,
    brand_id: m.families?.brands?.id,
    family_id: m.families?.id,
    model_id: m.id,
    model_name: m.name,
  }));

  // Reset form on defaultValues
  useEffect(() => {
    if (defaultValues) {
      reset({ ...defaultValues });
    } else {
      reset({
        product_type: "",
        part_type_id: "",
        model_id: "",
        name: "",
        sell_price: 0,
        cost_price: 0,
        stock: 0,
        is_active: true,
        description: "",
        warehouse_id: "",
        attributes: {},
      });
    }
  }, [defaultValues, reset]);

  const handleSelectModel = (value) => {
    if (!value) return;
    const fullName = `${value.brand_name} ${value.family_name} ${value.model_name}`;
    setValue("name", fullName);
    setValue("model_id", value.model_id);
    setValue("brand_id", value.brand_id);
    setValue("family_id", value.family_id);
  };

  const handleFormSubmit = (data) => {
    const payload = {
      ...data,
      sell_price: Number(data.sell_price),
      cost_price: Number(data.cost_price),
      stock: Number(data.stock),
      attributes: data.attributes,
    };
    onSubmit(payload);
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{defaultValues ? "Edit Product" : "Add Product"}</DialogTitle>
      <DialogContent>
        {/* Product Type */}
        <TextField
          select
          fullWidth
          margin="normal"
          label="Product Type"
          {...register("product_type")}
          error={!!errors.product_type}
          helperText={errors.product_type?.message}
        >
          {productTypes.map((pt) => (
            <MenuItem key={pt.id} value={pt.id}>
              {pt.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Part Type */}
        {selectedProductType && (
          <TextField
            select
            fullWidth
            margin="normal"
            label="Part Type"
            {...register("part_type_id")}
            error={!!errors.part_type_id}
            helperText={errors.part_type_id?.message}
          >
            {partTypes.map((pt) => (
              <MenuItem key={pt.id} value={pt.id}>
                {pt.name}
              </MenuItem>
            ))}
          </TextField>
        )}

        {/* Model Autocomplete for Spare Parts */}
        {selectedProductType === "spare_part" && (
          <Autocomplete
            options={modelOptions}
            filterOptions={(opts, state) => {
              const input = normalizeText(state.inputValue);
              return opts.filter((o) =>
                normalizeText(o.label).includes(input)
              );
            }}
            onChange={(e, value) => handleSelectModel(value)}
            inputValue={inputValue}
            onInputChange={(e, val) => setInputValue(val)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Model (Brand / Family / Model)"
                margin="normal"
              />
            )}
          />
        )}

        {/* Dynamic Attributes */}
        {attributes.map((attr) => (
          <TextField
            key={attr.id}
            fullWidth
            margin="normal"
            label={attr.name}
            {...register(`attributes.${attr.id}`)}
          />
        ))}

        {/* General Fields */}
        <TextField
          fullWidth
          margin="normal"
          label="Sell Price"
          type="number"
          {...register("sell_price", { valueAsNumber: true })}
          error={!!errors.sell_price}
          helperText={errors.sell_price?.message}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Cost Price"
          type="number"
          {...register("cost_price", { valueAsNumber: true })}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Stock"
          type="number"
          {...register("stock", { valueAsNumber: true })}
        />
        <TextField
          select
          fullWidth
          margin="normal"
          label="Warehouse"
          {...register("warehouse_id")}
          disabled={warehousesLoading}
        >
          {warehouses.map((w) => (
            <MenuItem key={w.id} value={w.id}>
              {w.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          margin="normal"
          label="Description"
          multiline
          rows={3}
          {...register("description")}
        />
        <FormControlLabel
          control={<Switch defaultChecked {...register("is_active")} />}
          label="Active"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit(handleFormSubmit)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
