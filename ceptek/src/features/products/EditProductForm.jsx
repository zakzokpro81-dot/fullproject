import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  Divider,
  FormControlLabel,
  Switch,
  Stack,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProductSchema } from "./product.schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAttributes,
  getProductAttributes,
  updateProduct,
  getWarehouses,
  getProductStockLocation,
  getCategories,
  adjustProductStock,
} from "./product.api";
import { StockAdjustmentDialog } from "./StockAdjustmentDialog";

const EditProductForm = ({ open, onClose, product, showSnackbar }) => {
  const queryClient = useQueryClient();
  const [isReady, setIsReady] = useState(false);
  // تعريف حالة لفتح وإغلاق نافذة التسوية المخزنية
  const [openAdjustment, setOpenAdjustment] = React.useState(false);
  // تم إضافة watch هنا لحل الخطأ الذي ظهر لك
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      sellPrice: 0,
      costPrice: 0,
      stock: 0,
      description: "",
      attributes: {},
      warehouse: null,
      category: null,
      is_active: false,
    },
  });

  // Queries
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: open,
  });
  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
    enabled: open,
  });

  const { data: attributes } = useQuery({
    queryKey: ["attributes", product?.product_type_id],
    queryFn: () => getAttributes(product?.product_type_id),
    enabled: !!product?.product_type_id && open,
  });

  const { data: currentAttrValues } = useQuery({
    queryKey: ["productAttributes", product?.id],
    queryFn: () => getProductAttributes(product?.id),
    enabled: !!product?.id && open,
  });

  // Mutation
  const mutation = useMutation({
    mutationFn: ({ id, payload }) => updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      onClose();
    },
    onError: (err) => {
      console.error("Update Error:", err);
      showSnackbar?.("Failed to update product", "error");
    },
  });

  const { data: currentStockEntry } = useQuery({
    queryKey: ["productStock", product?.id],
    queryFn: () => getProductStockLocation(product?.id),
    enabled: !!product?.id && open,
  });

  useEffect(() => {
    if (
      open &&
      product &&
      warehouses &&
      attributes &&
      currentAttrValues &&
      categories
    ) {
      // 1. تعبئة القيم الأساسية
      setValue("sellPrice", product.sell_price || 0);
      setValue("costPrice", product.cost_price || 0);
      setValue("stock", product.stock || 0);
      setValue("description", product.description || "");
      setValue("is_active", Boolean(product?.is_active));

      // Warehouse is set below via currentStockEntry or product.warehouse_id

      // 2. ربط الكاتاغوري بناءً على category_id
      if (product.category_id) {
        const currentCat = categories.find(
          (c) => Number(c.id) === Number(product.category_id),
        );
        if (currentCat) setValue("category", currentCat);
      }

      // 3. ربط السمات (Attributes)
      const attrMap = {};
      attributes.forEach((attr) => {
        const match = currentAttrValues.find((v) => v.attribute_id === attr.id);
        if (match) {
          if (attr.has_options && attr.options) {
            const selectedOption = attr.options.find(
              (opt) => opt.value === match.value,
            );
            attrMap[attr.slug] = selectedOption || {
              value: match.value,
              label: match.value,
            };
          } else {
            attrMap[attr.slug] = match.value;
          }
        }
      });
      setValue("attributes", attrMap);

      // 4. معالجة المستودع
      // نستخدم البيانات القادمة من الاستعلام الخاص بالمخزن (getProductStockLocation)
      // لأنها الأكثر دقة "مصدر الحقيقة"
      if (currentStockEntry?.warehouse) {
        setValue("warehouse", currentStockEntry.warehouse);
      } else if (product.warehouse_id) {
        // كخيار احتياطي إذا لم يتوفر الاستعلام الخاص
        const currentWarehouse = warehouses.find(
          (w) => Number(w.id) === Number(product.warehouse_id),
        );
        if (currentWarehouse) setValue("warehouse", currentWarehouse);
      }

      setIsReady(true);
    }
    // التعديل الجوهري هنا: إضافة currentStockEntry للمصفوفة
  }, [
    open,
    attributes,
    currentAttrValues,
    warehouses,
    product,
    categories,
    setValue,
    currentStockEntry,
  ]);

  const onSubmit = (data) => {
    const formattedAttributes = {};
    Object.keys(data.attributes || {}).forEach((key) => {
      const val = data.attributes[key];
      formattedAttributes[key] =
        val && typeof val === "object" ? val.value : val;
    });

    const payload = {
      ...product,
      sell_price: Number(data.sellPrice),
      cost_price: Number(data.costPrice),
      stock: Number(data.stock),
      description: data.description,
      // تحديث الحقول الهامة بناءً على التعديلات الأخيرة
      category_id: data.category?.id || product.category_id,
      warehouse_id: data.warehouse?.id || product.warehouse_id,
      attributes: formattedAttributes,
      is_active: Boolean(data.is_active),
    };

    mutation.mutate({ id: product.id, payload });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>Edit Product</DialogTitle>
      <DialogContent dividers>
        {!isReady ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TextField
              label="Category"
              fullWidth
              margin="normal"
              // استخدام watch هنا يضمن ظهور القيمة التي تم ضبطها في useEffect
              value={watch("category")?.name || "N/A"}
              disabled
            />
            <TextField
              label="Product Type"
              fullWidth
              margin="normal"
              value={product?.product_type?.name || "N/A"}
              disabled
            />
            <TextField
              label="Model"
              fullWidth
              margin="normal"
              value={product?.name || ""}
              disabled
            />
            <Divider sx={{ my: 2 }}>Attributes</Divider>
            {attributes?.map((attr) => (
              <Controller
                key={attr.id}
                name={`attributes.${attr.slug}`}
                control={control}
                render={({ field }) =>
                  attr.has_options ? (
                    <Autocomplete
                      {...field}
                      options={attr.options || []}
                      getOptionLabel={(option) => option?.value || ""}
                      value={field.value || null}
                      isOptionEqualToValue={(opt, val) =>
                        opt.value === val?.value
                      }
                      onChange={(_, val) => field.onChange(val)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={attr.name}
                          margin="normal"
                        />
                      )}
                    />
                  ) : (
                    <TextField
                      {...field}
                      label={attr.name}
                      margin="normal"
                      fullWidth
                    />
                  )
                }
              />
            ))}
            <Divider sx={{ my: 2 }}>Pricing & Stock</Divider>
            <Controller
              name="sellPrice"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Sell Price"
                  type="number"
                  margin="normal"
                  fullWidth
                />
              )}
            />
            <Controller
              name="costPrice"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Cost Price"
                  type="number"
                  margin="normal"
                  fullWidth
                />
              )}
            />
            {/* <Controller
              name="stock"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Stock"
                  type="number"
                  margin="normal"
                  fullWidth
                />
              )}
            /> */}

            <Stack direction="row" spacing={1} alignItems="center">
              <Controller
                name="stock"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Current Stock"
                    type="number"
                    margin="normal"
                    fullWidth
                    InputProps={{
                      readOnly: true, // للقراءة فقط
                      endAdornment: (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => setOpenAdjustment(true)} // هنا يتم استدعاء الدالة المعرفة أعلاه
                          sx={{ minWidth: "fit-content", ml: 1 }}
                        >
                          Adjust
                        </Button>
                      ),
                    }}
                  />
                )}
              />
            </Stack>

            <StockAdjustmentDialog
              open={openAdjustment}
              onClose={() => setOpenAdjustment(false)}
              product={product}
              warehouseId={
                currentStockEntry?.warehouse?.id || product?.warehouse_id
              }
              showSnackbar={showSnackbar}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  multiline
                  rows={2}
                  margin="normal"
                  fullWidth
                />
              )}
            />
            <Divider sx={{ my: 2 }}>Activation</Divider>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={!!field.value} />}
                  label="Active"
                />
              )}
            />
            {/* --- قسم المخزن الحالي (للعرض فقط) --- */}
            <Divider sx={{ my: 2 }}>Current Location</Divider>
            <TextField
              label="Current Warehouse"
              fullWidth
              margin="normal"
              // التعديل الجوهري: نقرأ من البيانات الأصلية مباشرة وليس من watch
              // وبهذا يظل ثابتاً حتى لو اخترت مستودعاً جديداً بالأسفل
              value={
                currentStockEntry?.warehouse?.name || "No Warehouse Assigned"
              }
              disabled
              helperText="This is the fixed current location."
            />
            {/* --- قسم نقل المنتج (قابل للتعديل) --- */}
            <Controller
              name="warehouse"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={warehouses || []}
                  getOptionLabel={(o) => o?.name || ""}
                  isOptionEqualToValue={(o, v) =>
                    Number(o.id) === Number(v?.id)
                  }
                  value={field.value || null}
                  onChange={(_, v) => field.onChange(v)} // هنا تتحدث "warehouse" في الفورم فقط
                  renderInput={(p) => (
                    <TextField
                      {...p}
                      label="Select New Warehouse"
                      margin="normal"
                    />
                  )}
                />
              )}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={mutation.isPending}
          sx={{ minWidth: 100 }}
        >
          {mutation.isPending ? <CircularProgress size={24} /> : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProductForm;
