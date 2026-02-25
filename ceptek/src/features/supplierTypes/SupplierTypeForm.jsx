import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  supplierTypeSchema,
  supplierTypeDefaults,
} from "./supplierType.schema";

export default function SupplierTypeForm({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  isPending = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(supplierTypeSchema),
    defaultValues: supplierTypeDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({ type_name: initialData.type_name || "" });
    } else {
      reset(supplierTypeDefaults);
    }
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "edit" ? "Edit Supplier Type" : "Add Supplier Type"}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Type Name"
          fullWidth
          margin="normal"
          {...register("type_name")}
          error={!!errors.type_name}
          helperText={errors.type_name?.message}
        />
      </DialogContent>
      <DialogActions>
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
