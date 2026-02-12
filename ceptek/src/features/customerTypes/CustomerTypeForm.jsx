import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { customerTypeSchema } from "./customerType.schema";
import {
  createCustomerType,
  updateCustomerType,
} from "./customerType.api";

export default function CustomerTypeForm({
  open,
  onClose,
  selectedCustomerType,
}) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(customerTypeSchema),
    defaultValues: {
      type_name: "",
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createCustomerType,
    onSuccess: () => {
      queryClient.invalidateQueries(["customer_types"]);
      handleClose();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateCustomerType,
    onSuccess: () => {
      queryClient.invalidateQueries(["customer_types"]);
      handleClose();
    },
  });

  useEffect(() => {
    if (selectedCustomerType) {
      reset({
        type_name: selectedCustomerType.type_name,
      });
    } else {
      reset({
        type_name: "",
      });
    }
  }, [selectedCustomerType, reset]);

  const onSubmit = (data) => {
    if (selectedCustomerType) {
      updateMutation.mutate({
        id: selectedCustomerType.id,
        ...data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {selectedCustomerType ? "Edit Customer Type" : "Add Customer Type"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Type Name"
            fullWidth
            {...register("type_name")}
            error={!!errors.type_name}
            helperText={errors.type_name?.message}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {selectedCustomerType ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
