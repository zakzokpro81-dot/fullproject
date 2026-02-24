import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Autocomplete,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productTypeAttributesSchema,
  productTypeAttributesDefaults,
} from "./productTypeAttributes.schema";

export default function ProductTypeAttributesForm({
  open,
  onClose,
  onSubmit,
  mode,
  initialData,
  isPending,
  productTypes = [],
  attributes = [],
}) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productTypeAttributesSchema),
    defaultValues: productTypeAttributesDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        product_type_id: initialData.product_type_id,
        attribute_id: initialData.attribute_id,
      });
    } else {
      reset(productTypeAttributesDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "edit"
          ? "Edit Product Type Attribute"
          : "Add Product Type Attribute"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Controller
            name="product_type_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={productTypes}
                getOptionLabel={(option) => option.name || ""}
                value={productTypes.find((p) => p.id === field.value) || null}
                onChange={(_, newValue) =>
                  field.onChange(newValue ? newValue.id : null)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Product Type"
                    error={!!errors.product_type_id}
                    helperText={errors.product_type_id?.message}
                  />
                )}
              />
            )}
          />

          <Controller
            name="attribute_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={attributes}
                getOptionLabel={(option) => option.name || ""}
                value={attributes.find((a) => a.id === field.value) || null}
                onChange={(_, newValue) =>
                  field.onChange(newValue ? newValue.id : null)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Attribute"
                    error={!!errors.attribute_id}
                    helperText={errors.attribute_id?.message}
                  />
                )}
              />
            )}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          {mode === "edit" ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
