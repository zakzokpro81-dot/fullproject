import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adjustProductStock } from "./product.api";

// ... الاستيرادات كما هي

export function StockAdjustmentDialog({ open, onClose, product, warehouseId }) {
  const queryClient = useQueryClient();
  const [newQuantity, setNewQuantity] = useState(0);
  const [reason, setReason] = useState("");

  React.useEffect(() => {
    if (open) {
      setNewQuantity(product?.stock || 0);
      setReason("");
    }
  }, [open, product]);

  const adjustmentMutation = useMutation({
    mutationFn: (variables) => adjustProductStock(product.id, variables),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      onClose();
      alert("Stock Updated Successfully");
    },
    onError: (error) => {
      console.error("Critical Mutation Error:", error);
    },
  });

  const handleConfirm = () => {
    // الحل النهائي: نستخدم warehouseId القادم من الأب، أو المخزن المسجل بالمنتج
    const finalWarehouseId = warehouseId || product?.warehouse_id;

    if (!finalWarehouseId) {
      alert("تنبيه: لا يوجد مستودع مرتبط بهذا المنتج.");
      return;
    }

    adjustmentMutation.mutate({
      newQuantity: Number(newQuantity),
      warehouse_id: Number(finalWarehouseId),
      reason: reason,
    });
  };

  // ... باقي كود الـ Return كما هو بدون أي تغيير

  const difference = Number(newQuantity) - Number(product?.stock || 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Stock Adjustment: {product?.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            System Record: <strong>{product?.stock}</strong>
          </Typography>

          <TextField
            label="Actual Quantity on Hand"
            type="number"
            fullWidth
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
          />

          <TextField
            label="Adjustment Reason (Optional)"
            multiline
            rows={2}
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {difference !== 0 && (
            <Alert severity={difference > 0 ? "info" : "warning"}>
              Inventory will be updated by:{" "}
              <strong>{difference > 0 ? `+${difference}` : difference}</strong>
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={difference === 0 || adjustmentMutation.isPending}
        >
          {adjustmentMutation.isPending ? "Saving..." : "Confirm Adjustment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
