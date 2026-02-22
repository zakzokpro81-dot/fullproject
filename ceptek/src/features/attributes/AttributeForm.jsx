import { useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Switch, FormControlLabel,
  CircularProgress, MenuItem,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { attributeSchema, attributeDefaults } from "./attributes.schema";

export default function AttributeForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attributeSchema),
    defaultValues: attributeDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset(initialData);
    } else {
      reset(attributeDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "edit" ? "Edit Attribute" : "Add Attribute"}</DialogTitle>
      <DialogContent dividers>
        <TextField
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
          fullWidth
          margin="normal"
          label="Name"
        />
        <TextField
          {...register("slug")}
          error={!!errors.slug}
          helperText={errors.slug?.message}
          fullWidth
          margin="normal"
          label="Slug"
        />
        <TextField
          select
          label="Data Type"
          {...register("data_type")}
          defaultValue="text"
          fullWidth
          margin="normal"
        >
          <MenuItem value="text">Text</MenuItem>
          <MenuItem value="number">Number</MenuItem>
          <MenuItem value="boolean">Boolean</MenuItem>
        </TextField>
        <FormControlLabel
          control={<Switch
            checked={watch("has_options")}
            onChange={(e) => setValue("has_options", e.target.checked)}
          />}
          label="Has Options"
        />
        <FormControlLabel
          control={<Switch
            checked={watch("is_active")}
            onChange={(e) => setValue("is_active", e.target.checked)}
          />}
          label="Active"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
