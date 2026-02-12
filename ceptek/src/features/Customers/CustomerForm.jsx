import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  Stack,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerSchema } from "./customer.schema";
import { createCustomer, updateCustomer } from "./customer.api";

export default function CustomerForm({
  open,
  onClose,
  initialData,
  customerTypes,
}) {
  const queryClient = useQueryClient();
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || {
      name: "",
      store_name: "",
      email: "",
      phone: "",
      address: "",
      customer_type_id: "",
      is_active: true,
    },
  });

  // Mutation للحفظ أو التعديل
  const mutation = useMutation({
    mutationFn: isEditMode ? updateCustomer : createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      onClose();
      reset();
    },
  });

  const onSubmit = (data) => {
    // التأكد من إرسال الـ ID في حالة التعديل
    if (isEditMode) {
      mutation.mutate({ id: initialData.id, ...data });
    } else {
      mutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? "Edit Customer Details" : "Add New Customer"}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {/* استخدام Stack لترتيب الحقول عمودياً بشكل تلقائي */}
          <Stack spacing={2.5}>
            <TextField
              {...register("name")}
              label="Full Name"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              {...register("store_name")}
              label="Store Name"
              fullWidth
            />

            <TextField
              {...register("email")}
              label="Email Address"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField {...register("phone")} label="Phone Number" fullWidth />

            <TextField
              {...register("address")}
              label="Address"
              fullWidth
              multiline
              rows={3}
            />

            <TextField
              select
              fullWidth
              label="Customer Type"
              {...register("customer_type_id")}
              defaultValue={initialData?.customer_type_id || ""}
              error={!!errors.customer_type_id}
            >
              <MenuItem value="">None</MenuItem>
              {customerTypes?.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.type_name}
                </MenuItem>
              ))}
            </TextField>

            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Active Status"
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Saving..." : "Save Customer"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
