import { useState } from "react";
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
  Autocomplete,
  Snackbar,
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  stockMovementSchema,
  stockMovementDefaults,
} from "./stockMovement.schema";
import { normalizeText } from "../../utils/textUtils";

export default function StockMovementForm({
  open,
  onClose,
  onSubmit,
  isPending,
  products = [],
  warehouses = [],
  movementTypes = [],
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: stockMovementDefaults,
  });

  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const handleCloseAlert = () =>
    setAlertState((prev) => ({ ...prev, open: false }));

  const handleFormSubmit = (data) => {
    const selectedProduct = products.find((p) => p.id === data.product_id);
    const movementType = Number(data.movement_type_id);

    const isPurchase = [1, 3].includes(movementType);
    if (isPurchase && selectedProduct?.status === "phase_out") {
      setAlertState({
        open: true,
        message: `"${selectedProduct.name}" is in Liquidation. Purchasing is blocked.`,
        severity: "warning",
      });
      return;
    }

    const isSale = [2, 4].includes(movementType);
    if (isSale && selectedProduct?.status === "purchase_only") {
      setAlertState({
        open: true,
        message: `"${selectedProduct.name}" is Purchase Only. Sales blocked.`,
        severity: "error",
      });
      return;
    }

    onSubmit({
      ...data,
      product_id: Number(data.product_id),
      warehouse_id: Number(data.warehouse_id),
      movement_type_id: movementType,
      quantity: Number(data.quantity),
      unit_cost: parseFloat(data.unit_cost),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Record Stock Movement</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Controller
              name="product_id"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <Autocomplete
                  options={products}
                  value={products.find((p) => p.id === value) || null}
                  onChange={(_, newValue) =>
                    onChange(newValue ? newValue.id : "")
                  }
                  getOptionLabel={(option) => option.name || ""}
                  isOptionEqualToValue={(option, val) => option.id === val?.id}
                  filterOptions={(options, state) => {
                    const search = normalizeText(state.inputValue).trim();
                    const isPurchaseType = [1, 3].includes(
                      Number(watch("movement_type_id")),
                    );
                    return options.filter((product) => {
                      const matchesSearch = normalizeText(
                        product.name,
                      ).includes(search);
                      if (isPurchaseType && product.status === "phase_out")
                        return false;
                      return matchesSearch;
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Product"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          width="100%"
                          sx={{ px: 1 }}
                        >
                          <Box component="span">{option.name}</Box>
                          {option.status === "phase_out" && (
                            <Box
                              component="span"
                              sx={{
                                color: "orange",
                                fontSize: "0.7rem",
                                fontWeight: "bold",
                                border: "1px solid orange",
                                borderRadius: "4px",
                                px: 0.5,
                                ml: 1,
                              }}
                            >
                              Liquidation
                            </Box>
                          )}
                          {option.status === "purchase_only" && (
                            <Box
                              component="span"
                              sx={{
                                color: "#0288d1",
                                fontSize: "0.7rem",
                                fontWeight: "bold",
                                border: "1px solid #0288d1",
                                borderRadius: "4px",
                                px: 0.5,
                                ml: 1,
                              }}
                            >
                              Incoming
                            </Box>
                          )}
                        </Stack>
                      </li>
                    );
                  }}
                />
              )}
            />

            <TextField
              select
              label="Warehouse"
              {...register("warehouse_id")}
              error={!!errors.warehouse_id}
              fullWidth
              defaultValue=""
            >
              <MenuItem value="">Select Warehouse...</MenuItem>
              {warehouses.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Movement Type"
              {...register("movement_type_id")}
              error={!!errors.movement_type_id}
              fullWidth
              defaultValue=""
            >
              <MenuItem value="">Select Movement Type...</MenuItem>
              {movementTypes.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.movement_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Quantity"
              type="number"
              {...register("quantity")}
              error={!!errors.quantity}
              fullWidth
              helperText={
                errors.quantity?.message || "Use negative for deductions"
              }
            />

            <TextField
              label="Unit Cost"
              type="number"
              {...register("unit_cost")}
              error={!!errors.unit_cost}
              fullWidth
            />

            <TextField
              label="Reference Note"
              {...register("reference_type")}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? "Saving..." : "Save Movement"}
          </Button>
        </DialogActions>
      </Box>

      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertState.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
