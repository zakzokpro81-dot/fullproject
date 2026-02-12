import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Box,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentSchema } from "./payment.schema";
import { createPayment, updatePayment } from "./payment.api";
import supabase from "../../config/supabase";

export default function PaymentForm({ open, onClose, initialData }) {
  const queryClient = useQueryClient();
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData || {
      invoice_id: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  // جلب الفواتير مع أسماء الزبائن للاختيار منها
  const { data: invoices } = useQuery({
    queryKey: ["invoicesSelect"],
    queryFn: async () => {
      const { data } = await supabase
        .from("invoices")
        .select("id, invoice_number, customers(name)");
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: isEditMode ? updatePayment : createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries(["payments"]);
      onClose();
      reset();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? "Edit Payment" : "New Payment"}</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit((data) =>
          mutation.mutate(isEditMode ? { id: initialData.id, ...data } : data),
        )}
      >
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              select
              label="Select Invoice"
              fullWidth
              {...register("invoice_id")}
              defaultValue={initialData?.invoice_id || ""}
              error={!!errors.invoice_id}
              helperText={errors.invoice_id?.message}
            >
              {invoices?.map((inv) => (
                <MenuItem key={inv.id} value={inv.id}>
                  Inv: {inv.invoice_number || inv.id} - {inv.customers?.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Amount"
              type="number"
              fullWidth
              {...register("amount")}
              error={!!errors.amount}
              helperText={errors.amount?.message}
            />
            <TextField
              label="Date"
              type="date"
              fullWidth
              {...register("date")}
              InputLabelProps={{ shrink: true }}
              error={!!errors.date}
              helperText={errors.date?.message}
            />
            <TextField
              label="Notes"
              multiline
              rows={3}
              fullWidth
              {...register("notes")}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isLoading}
          >
            Save
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
