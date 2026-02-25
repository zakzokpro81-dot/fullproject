import { useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          ? t("common.editItem", { item: t("productTypeAttributes.entity") })
          : t("common.addNew")}
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
                    label={t("productTypeAttributes.productType")}
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
                    label={t("productTypeAttributes.attribute")}
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
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          {isPending ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
