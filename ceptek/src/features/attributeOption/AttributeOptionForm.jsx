import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  attributeOptionSchema,
  attributeOptionDefaults,
} from "./attributeOption.schema";

export default function AttributeOptionForm({
  open,
  mode = "add",
  initialData = null,
  onClose,
  onSubmit,
  isPending = false,
  attributes = [],
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attributeOptionSchema),
    defaultValues: attributeOptionDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        attribute_id: initialData.attribute_id,
        value: initialData.value,
        slug: initialData.slug,
      });
    } else {
      reset(attributeOptionDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {mode === "add" ? "Add Attribute Option" : "Edit Attribute Option"}
      </DialogTitle>
      <DialogContent dividers>
        {/* Attribute */}
        <TextField
          select
          label="Attribute"
          {...register("attribute_id")}
          fullWidth
          slotProps={{ select: { displayEmpty: false } }}
          margin="normal"
          error={!!errors.attribute_id}
          helperText={errors.attribute_id?.message}
        >
          <MenuItem value="">Select Attribute...</MenuItem>
          {attributes.map((attr) => (
            <MenuItem key={attr.id} value={attr.id}>
              {attr.name} ({attr.data_type})
            </MenuItem>
          ))}
        </TextField>

        {/* Value */}
        <TextField
          {...register("value")}
          label="Value"
          fullWidth
          margin="normal"
          error={!!errors.value}
          helperText={errors.value?.message}
        />

        {/* Slug */}
        <TextField
          {...register("slug")}
          label="Slug"
          fullWidth
          margin="normal"
          error={!!errors.slug}
          helperText={errors.slug?.message}
          placeholder="e.g., color-red"
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          startIcon={
            isPending ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
