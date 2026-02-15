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
  Autocomplete,
  Snackbar,
  Alert
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stockMovementSchema } from "./stockMovement.schema";
import {
  createStockMovement,
  getMovementTypes,
  getWarehouses,
} from "./stockMovement.api";
import supabase from "../../config/supabase";

export default function StockMovementForm({ open, onClose }) {
  const queryClient = useQueryClient();
  
  // دالة لتطبيع النصوص (تركي/عربي) للبحث
  function normalizeText(text) {
    if (!text) return "";
    const map = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", I: "i", Ö: "o", Ş: "s", Ü: "u" };
    return text.replace(/[çğıİöşüÇĞIÖŞÜ]/g, (m) => map[m]).toLowerCase();
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    resetField, // أضفناها لتنظيف حقل معين عند الخطأ
    watch,
  } = useForm({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      quantity: 0,
      unit_cost: 0,
      reference_type: "",
      product_id: "",
      movement_type_id: ""
    },
  });

  // حالة التنبيه الموحدة
  const [alertState, setAlertState] = React.useState({ 
    open: false, 
    message: "", 
    severity: "error" 
  });

  const handleCloseAlert = () => setAlertState((prev) => ({ ...prev, open: false }));

  // الاستعلامات
  const { data: types } = useQuery({ queryKey: ["movTypes"], queryFn: getMovementTypes });
  const { data: warehouses } = useQuery({ queryKey: ["warehouses"], queryFn: getWarehouses });
  const { data: products } = useQuery({
    queryKey: ["productsForMovement"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, status, stock")
        .neq("status", "inactive")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: createStockMovement,
    onSuccess: () => {
      queryClient.invalidateQueries(["stockMovements"]);
      queryClient.invalidateQueries(["products"]);
      onClose();
      reset();
    },
    onError: (err) => {
      setAlertState({ open: true, message: "Error saving: " + err.message, severity: "error" });
    },
  });

  const onSubmit = (data) => {
    const selectedProduct = products?.find((p) => p.id === data.product_id);
    const movementType = Number(data.movement_type_id);

    // 1. منع الشراء لمواد التصفية (IDs: 1, 3)
    const isPurchase = [1, 3].includes(movementType);
    if (isPurchase && selectedProduct?.status === "phase_out") {
      setAlertState({
        open: true,
        message: `The product "${selectedProduct.name}" is in Liquidation. Purchasing is blocked.`,
        severity: "warning",
      });
      return;
    }

    // 2. منع البيع لمواد "الشراء فقط" (IDs: 2, 4)
    const isSale = [2, 4].includes(movementType);
    if (isSale && selectedProduct?.status === "purchase_only") {
      setAlertState({
        open: true,
        message: `The product "${selectedProduct.name}" is for 'Purchase Only'. Sales blocked.`,
        severity: "error",
      });
      return;
    }

    const payload = {
      ...data,
      product_id: Number(data.product_id),
      warehouse_id: Number(data.warehouse_id),
      movement_type_id: movementType,
      quantity: Number(data.quantity),
      unit_cost: parseFloat(data.unit_cost),
    };

    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Record Stock Movement</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            
            <Controller
              name="product_id"
              control={control}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Autocomplete
                  options={products || []}
                  value={products?.find((p) => p.id === value) || null}
                  onChange={(_, newValue) => onChange(newValue ? newValue.id : "")}
                  getOptionLabel={(option) => option.name || ""}
                  isOptionEqualToValue={(option, val) => option.id === val?.id}
                  filterOptions={(options, state) => {
                    const search = normalizeText(state.inputValue).trim();
                    const isPurchase = [1, 3].includes(Number(watch("movement_type_id")));
                    return options.filter((product) => {
                      const matchesSearch = normalizeText(product.name).includes(search);
                      if (isPurchase && product.status === 'phase_out') return false;
                      return matchesSearch;
                    });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Search Product" fullWidth error={!!error} helperText={error?.message} />
                  )}
               renderOption={(props, option) => {
  // نقوم باستخراج الـ key من الـ props لضمان عدم تكراره أو تضاربه
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
        
        {/* ملصق حالة التصفية بشكل أوضح */}
        {option.status === 'phase_out' && (
          <Box 
            component="span" 
            sx={{ 
              color: 'orange', 
              fontSize: '0.7rem', 
              fontWeight: 'bold',
              border: '1px solid orange',
              borderRadius: '4px',
              px: 0.5,
              ml: 1
            }}
          >
            Liquidation
          </Box>
        )}

        {/* ملصق حالة الشراء فقط في حال أضفتها مستقبلاً */}
        {option.status === 'purchase_only' && (
          <Box 
            component="span" 
            sx={{ 
              color: '#0288d1', 
              fontSize: '0.7rem', 
              fontWeight: 'bold',
              border: '1px solid #0288d1',
              borderRadius: '4px',
              px: 0.5,
              ml: 1
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
              {warehouses?.map((w) => (
                <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
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
              {types?.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.movement_name}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Quantity"
              type="number"
              {...register("quantity")}
              error={!!errors.quantity}
              fullWidth
              helperText={errors.quantity?.message || "Use negative for deductions"}
            />

            <TextField
              label="Unit Cost"
              type="number"
              {...register("unit_cost")}
              error={!!errors.unit_cost}
              fullWidth
            />

            <TextField label="Reference Note" {...register("reference_type")} fullWidth />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Movement"}
          </Button>
        </DialogActions>
      </Box>

      {/* التنبيه الاحترافي */}
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseAlert} severity={alertState.severity} variant="filled" sx={{ width: "100%" }}>
          {alertState.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}