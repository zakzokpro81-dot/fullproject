import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form"; // أضفنا Controller
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "./category.schema";

const defaultFormValues = {
  name: "",
  slug: "",
  show_all_models: false,
  is_active: true,
};

export default function CategoryForm({
  open,
  onClose,
  onSubmit,
  defaultValues = null,
  isEditing = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    control, // استخراج control لاستخدامه مع الـ Controller
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultFormValues,
  });

  // تحديث القيم عند فتح المودال للتحرير
  useEffect(() => {
    if (open) {
      // تأكد من إعادة الضبط عند فتح المودال
      if (defaultValues) {
        reset({
          ...defaultFormValues,
          ...defaultValues,
        });
      } else {
        reset(defaultFormValues);
      }
    }
  }, [defaultValues, reset, open]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? "Edit Category" : "Add Category"}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Name"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
            InputLabelProps={{ shrink: true }} // لضمان عدم تداخل النص عند التحرير
          />

          <TextField
            label="Slug"
            {...register("slug")}
            error={!!errors.slug}
            helperText={errors.slug?.message}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* استخدام Controller للتحكم في Switch الحالة النشطة */}
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={!!field.value} // ربط القيمة بـ checked
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Active"
              />
            )}
          />

          {/* استخدام Controller للتحكم في Switch إظهار الموديلات */}
          <Controller
            name="show_all_models"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Show All Models"
              />
            )}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit(handleFormSubmit)}>
          {isEditing ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
