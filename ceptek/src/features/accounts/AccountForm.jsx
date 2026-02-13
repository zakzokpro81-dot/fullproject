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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountSchema } from "./account.schema";
import { createAccount } from "./account.api";

export default function AccountForm({ open, onClose }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      account_type: "cash",
      balance: 0,
      is_active: true,
    },
  });

  const mutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries(["accounts"]);
      onClose();
      reset();
    },
    onError: (err) => {
      alert("Error: " + err.message);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Add New Cash Box / Account</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label="Account Name"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />

            <TextField
              select
              label="Type"
              {...register("account_type")}
              error={!!errors.account_type}
              fullWidth
              defaultValue="cash"
            >
              <MenuItem value="cash">Cash </MenuItem>
              <MenuItem value="bank">Bank</MenuItem>
            </TextField>

            <TextField
              label="Initial Balance"
              type="number"
              {...register("balance")}
              error={!!errors.balance}
              fullWidth
            />

            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="Account Active"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save Account"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
