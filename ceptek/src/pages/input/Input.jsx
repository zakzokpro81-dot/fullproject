import { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Snackbar,
  Alert,
  Typography,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useForm } from "react-hook-form";
import supabase from "../../config/supabase";

export function Input() {
  const [open, setOpen] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  const [brands, setBrands] = useState([]);
  const [families, setFamilies] = useState([]);
  const [models, setModels] = useState([]);

  useEffect(() => {
    const fetchBrand = async () => {
      const { data, error } = await supabase.from("brands").select();
      if (error) return;
      setBrands(data);
    };

    const fetchFamilies = async () => {
      const { data, error } = await supabase.from("families").select();
      if (error) return;
      setFamilies(data);
    };

    const fetchModels = async () => {
      const { data, error } = await supabase.from("models").select();
      if (error) return;
      setModels(data);
    };

    fetchBrand();
    fetchFamilies();
    fetchModels();
  }, []);

  // Filter families by selected brand
  const filteredFamilies = families.filter((f) => f.brand === selectedBrand);

  // Filter models by selected family
  const filteredModels = models.filter((m) => m.family === selectedFamily);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = () => setOpen(true);

  return (
    <Box
      onSubmit={handleSubmit(onSubmit)}
      component="form"
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      noValidate
      autoComplete="off"
    >
      <Typography variant="h5" mb={1}>
        Quick Entry Form
      </Typography>

      {/* Brand Dropdown */}
      <FormControl variant="filled" fullWidth>
        <InputLabel>Brand</InputLabel>
        <Select
          {...register("brand", { required: true })}
          value={selectedBrand || ""}
          onChange={(e) => {
            setSelectedBrand(Number(e.target.value));
            setSelectedFamily(null);
            setSelectedModel(null);
          }}
          error={!!errors.brand}
        >
          <MenuItem value="">Select brand</MenuItem>
          {brands.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Family Dropdown */}
      <FormControl variant="filled" fullWidth>
        <InputLabel>Family</InputLabel>
        <Select
          {...register("family", { required: true })}
          value={selectedFamily || ""}
          onChange={(e) => {
            setSelectedFamily(Number(e.target.value));
            setSelectedModel(null);
          }}
          disabled={!selectedBrand}
          error={!!errors.family}
        >
          <MenuItem value="">Select family</MenuItem>
          {filteredFamilies.map((f) => (
            <MenuItem key={f.id} value={f.id}>
              {f.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Model Dropdown */}
      <FormControl variant="filled" fullWidth>
        <InputLabel>Model</InputLabel>
        <Select
          {...register("model", { required: true })}
          value={selectedModel || ""}
          onChange={(e) => setSelectedModel(Number(e.target.value))}
          disabled={!selectedFamily}
          error={!!errors.model}
        >
          <MenuItem value="">Select model</MenuItem>
          {filteredModels.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        {...register("part", { required: true, minLength: 3 })}
        helperText={errors.part ? "Required field" : null}
        error={!!errors.part}
        label="Part"
        variant="filled"
      />

      <TextField
        {...register("quality", { required: true, minLength: 3 })}
        helperText={errors.quality ? "Required field" : null}
        error={!!errors.quality}
        label="Quality"
        variant="filled"
      />

      <TextField
        {...register("brand_name", { required: true, minLength: 3 })}
        helperText={errors.brand_name ? "Required field" : null}
        error={!!errors.brand_name}
        label="Brand Name"
        variant="filled"
      />

      <TextField
        {...register("quantity", { required: true, minLength: 1 })}
        helperText={errors.quantity ? "Required field" : null}
        error={!!errors.quantity}
        label="Quantity"
        variant="filled"
      />

      <TextField
        {...register("price", { required: true, minLength: 1 })}
        helperText={errors.price ? "Required field" : null}
        error={!!errors.price}
        label="Price"
        variant="filled"
      />

      <Box textAlign="right">
        <Button type="submit" sx={{ textTransform: "capitalize" }}>
          Create New Entry
        </Button>

        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
        >
          <Alert
            onClose={handleClose}
            severity="info"
            variant="filled"
            sx={{ width: "100%" }}
          >
            Submitted successfully
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
