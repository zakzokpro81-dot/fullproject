import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Grid,
} from "@mui/material";

// افتراضاً أن هذه الدالة موجودة في ملف الـ API الخاص بك
// سنضعها هنا بشكل مؤقت أو استبدلها بطلب Supabase الحقيقي
const fetchAttributesByType = async (typeId) => {
  // منطق جلب الخصائص من جدول attributes بناءً على الـ typeId
  return [];
};

export function AddProductDialog({
  open,
  onClose,
  warehouses = [],
  productTypes = [],
  onSave,
}) {
  const [formData, setFormData] = React.useState({
    name: "",
    product_type_id: "",
    warehouse_id: "",
    initial_stock: 0,
    attributes: {},
  });

  const [dynamicAttrs, setDynamicAttrs] = React.useState([]);

  // عند تغيير نوع المنتج، نجلب الخصائص المرتبطة به
  const handleTypeChange = async (typeId) => {
    setFormData({ ...formData, product_type_id: typeId });

    try {
      // هنا تضع دالة الجلب الخاصة بك
      // const attrs = await fetchAttributesByType(typeId);
      // setDynamicAttrs(attrs || []);
    } catch (error) {
      console.error("Error fetching attributes:", error);
    }
  };

  const handleSubmit = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        Add New Product & Initial Stock
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Product Name"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Product Type</InputLabel>
              <Select
                value={formData.product_type_id}
                label="Product Type"
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                {productTypes?.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Target Warehouse</InputLabel>
              <Select
                value={formData.warehouse_id}
                label="Target Warehouse"
                onChange={(e) =>
                  setFormData({ ...formData, warehouse_id: e.target.value })
                }
              >
                {warehouses?.map((w) => (
                  <MenuItem key={w.id} value={w.id}>
                    {w.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <TextField
            label="Initial Quantity (Opening Stock)"
            type="number"
            fullWidth
            value={formData.initial_stock}
            onChange={(e) =>
              setFormData({ ...formData, initial_stock: e.target.value })
            }
          />

          {/* عرض الخصائص الديناميكية بناءً على النوع المختار */}
          {dynamicAttrs?.length > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: "#f8f9fa",
                borderRadius: 2,
                border: "1px solid #eee",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, color: "primary.main" }}
              >
                Product Specifications (Attributes)
              </Typography>
              <Grid container spacing={2}>
                {dynamicAttrs.map((attr) => (
                  <Grid item xs={12} sm={6} key={attr.id}>
                    <TextField
                      label={attr.name}
                      fullWidth
                      size="small"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          attributes: {
                            ...formData.attributes,
                            [attr.id]: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!formData.name || !formData.product_type_id}
        >
          Save Product
        </Button>
      </DialogActions>
    </Dialog>
  );
}
