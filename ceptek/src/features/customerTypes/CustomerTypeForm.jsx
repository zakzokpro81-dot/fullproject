import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerTypeSchema } from "./customerType.schema";
import { createCustomerType, updateCustomerType } from "./customerType.api";

export default function CustomerTypeForm({ open, onClose, initialData }) {
  const queryClient = useQueryClient();
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(customerTypeSchema),
    defaultValues: initialData || { type_name: "" },
  });

  // الـ Mutation للإضافة أو التعديل
  const mutation = useMutation({
    mutationFn: isEditMode ? updateCustomerType : createCustomerType,
    onSuccess: () => {
      queryClient.invalidateQueries(["customerTypes"]);
      onClose();
      reset();
    },
  });

  const onSubmit = (data) => {
    if (isEditMode) {
      mutation.mutate({ id: initialData.id, ...data });
    } else {
      mutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? "تعديل نوع الزبون" : "إضافة نوع زبون جديد"}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <TextField
            {...register("type_name")}
            label="اسم النوع"
            fullWidth
            error={!!errors.type_name}
            helperText={errors.type_name?.message}
            autoFocus
            margin="dense"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
