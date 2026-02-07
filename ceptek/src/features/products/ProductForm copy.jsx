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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "./product.schema";
import { useQuery } from "@tanstack/react-query";
import { getModelsForProduct } from "./product.api";
import { useEffect, useState } from "react";
import supabase from "../../config/supabase";

function normalizeText(text) {
  const map = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u" };
  return text.toLowerCase().replace(/[çğıİöşü]/g, (m) => map[m]);
}

export default function ProductForm({ open, onClose, onSubmit, defaultValues }) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      brand_id: "",
      family_id: "",
      model_id: "",
      sell_price: 0,
      cost_price: 0,
      stock: 0,
      is_active: true,
      description: "",
      warehouse_id: "",
      part_type_id: 0,
      part_name: "",
    },
  });

  const [aaa, setaaa] = useState(1);
  const [bbb, setbbb] = useState(1);
  const [eee, seteee] = useState("");

  const warehouseValue = watch("warehouse_id");
  const partValue = watch("part_type_id");

  const { data: models = [] } = useQuery({
    queryKey: ["models-for-products"],
    queryFn: getModelsForProduct,
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

  const { data: parts = [], isLoading: partsLoading } = useQuery({
    queryKey: ["parts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("part_types")
        .select("id, name")
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const [inputValue, setInputValue] = useState("");

  const options = models.map((m) => ({
    label: `${m.families?.brands?.name} ${m.families?.name} ${m.name}`,
    brand_id: m.families?.brands?.id,
    family_id: m.families?.id,
    model_id: m.id,
    model_name: m.name,
    brand_name: m.families?.brands?.name,
    family_name: m.families?.name,
  }));

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        warehouse_id: defaultValues.warehouse_id ?? "",
      });
    } else {
      reset({
        name: "",
        brand_id: "",
        family_id: "",
        model_id: "",
        sell_price: 0,
        cost_price: 0,
        stock: 0,
        is_active: true,
        description: "",
        warehouse_id: "",
        part_name: "",
        part_type_id: 0,
      });
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    if (warehouses.length > 0 && !warehouseValue) {
      setValue("warehouse_id", warehouses[0].id, { shouldDirty: true });
      setaaa(Number(warehouses[0].id));
    }
  }, [warehouses, setValue, warehouseValue]);

  useEffect(() => {
    if (parts.length > 0 && !partValue) {
      setValue("part_type_id", parts[0].id, { shouldDirty: true });
      setbbb(parts[0].id);
      seteee(parts[0].name);
    }
  }, [parts, setValue, partValue]);

  const handleSelectModel = (value) => {
    if (!value) return;

    const fullName = `${value.brand_name} ${value.family_name} ${value.model_name}`;

    setValue("name", fullName);
    setValue("brand_id", value.brand_id);
    setValue("family_id", value.family_id);
    setValue("model_id", value.model_id);
  };

  const handleFormSubmit = (data) => {
    const payload = {
      ...data,
      sell_price: Number(data.sell_price),
      cost_price: Number(data.cost_price),
      stock: Number(data.stock),
      description: data.description ?? "",
      part_name: eee,
      warehouse_id: aaa,
      part_type_id: bbb,
    };

    onSubmit(payload);
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {defaultValues ? "Edit Product" : "Add Product"}
      </DialogTitle>

      <DialogContent>
        <Autocomplete
          options={options}
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

        <TextField
          select
          fullWidth
          margin="normal"
          label="Parts"
          value={partValue || ""}
          onChange={(e) => {
            const selectedId = Number(e.target.value);
            const selectedPart = parts.find((p) => p.id === selectedId);

            setValue("part_type_id", selectedId, { shouldDirty: true });
            setbbb(selectedId);
            seteee(selectedPart?.name || "");
          }}
          error={!!errors.part_type_id}
          helperText={errors.part_type_id?.message}
          disabled={partsLoading}
        >
          {parts.map((part) => (
            <MenuItem key={part.id} value={part.id}>
              {part.name}
            </MenuItem>
          ))}
        </TextField>

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
          value={warehouseValue || ""}
          onChange={(e) => {
            setValue("warehouse_id", e.target.value, { shouldDirty: true });
            setaaa(Number(e.target.value));
          }}
          error={!!errors.warehouse_id}
          helperText={errors.warehouse_id?.message}
          disabled={warehousesLoading}
        >
          {warehouses.map((warehouse) => (
            <MenuItem key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
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
          error={!!errors.description}
          helperText={errors.description?.message}
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
