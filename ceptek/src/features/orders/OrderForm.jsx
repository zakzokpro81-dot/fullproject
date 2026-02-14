import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  CircularProgress,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderSchema } from "./order.schema";
import { createOrderAction } from "./order.api";
import supabase from "../../config/supabase";
import { Controller } from "react-hook-form";
import { Autocomplete } from "@mui/material";
export default function OrderForm({ open, onClose }) {
  function normalizeText(text) {
    const map = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u" };
    return text.toLowerCase().replace(/[çğıİöşü]/g, (m) => map[m]);
  }

  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch, // ← أضف هذا
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_id: "",
      warehouse_id: "",
      notes: "",
      items: [{ product_id: "", quantity: 1, notes: "" }],
    },
  });
  const [stockError, setStockError] = React.useState({
    open: false,
    message: "",
  });
  // --- Data Fetching using correct table names ---
  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data } = await supabase.from("customers").select("id, name");
      return data || [];
    },
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const { data } = await supabase.from("warehouses").select("id, name");
      return data || [];
    },
  });

  //   const { data: products, isLoading: loadingProducts } = useQuery({
  //     queryKey: ["products"],
  //     queryFn: async () => {
  //       // Adjusted to use your 'products' table and 'name' column
  //       const { data, error } = await supabase
  //         .from("products")
  //         .select("id, name, sku")
  //         .eq("is_active", true); // Only fetch active products
  //       if (error) throw error;
  //       return data || [];
  //     },
  //   });

  const warehouseId = watch("warehouse_id"); // مراقبة المستودع المحدد

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["products", warehouseId],
    queryFn: async () => {
      if (!warehouseId) return [];

      const { data, error } = await supabase
        .from("products")
        .select(
          `
        id,
        name,
        sku,
        warehouse_stock!inner (
          warehouse_id,
          quantity
        )
      `,
        )
        .eq("is_active", true)
        .eq("warehouse_stock.warehouse_id", warehouseId) // التصفية الصحيحة
        .gt("warehouse_stock.quantity", 0); // اختيارياً: عرض المنتجات التي فيها كمية فقط

      if (error) {
        console.error("Error fetching filtered products:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!warehouseId,
  });

  //   const {
  //     register,
  //     control,
  //     handleSubmit,
  //     reset,
  //     formState: { errors },
  //   } = useForm({
  //     resolver: zodResolver(orderSchema),
  //     defaultValues: {
  //       customer_id: "",
  //       warehouse_id: "",
  //       notes: "",
  //       items: [{ product_id: "", quantity: 1, notes: "" }],
  //     },
  //   });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const mutation = useMutation({
    mutationFn: createOrderAction,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      reset();
      onClose();
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", textAlign: "center", py: 2 }}>
        New Sales Order
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Box component="form" noValidate>
          <Stack spacing={4}>
            {/* 1. Header Section - Vertical Layout */}
            <Stack spacing={2.5}>
              <Controller
                control={control}
                name="customer_id"
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={customers || []}
                    getOptionLabel={(option) => {
                      // التعامل مع القيمة إذا كانت مجرد ID أو كائن كامل
                      const customer =
                        customers?.find((c) => c.id === value) || option;
                      return customer?.name || "";
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.id === (value?.id || value)
                    }
                    value={customers?.find((c) => c.id === value) || null}
                    onChange={(_, newValue) => {
                      onChange(newValue ? newValue.id : "");
                    }}
                    // دالة الفلترة لدعم البحث باللغة التركية/العربية
                    filterOptions={(options, { inputValue }) => {
                      const normalizedInput = normalizeText(inputValue);
                      return options.filter((c) =>
                        normalizeText(c.name).includes(normalizedInput),
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Customer"
                        error={!!errors.customer_id}
                        helperText={errors.customer_id?.message}
                        placeholder="Search for a customer..."
                      />
                    )}
                  />
                )}
              />

              <TextField
                select
                fullWidth
                label="Warehouse"
                defaultValue=""
                {...register("warehouse_id", { valueAsNumber: true })}
                error={!!errors.warehouse_id}
              >
                {warehouses?.map((w) => (
                  <MenuItem key={w.id} value={w.id}>
                    {w.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Order Notes"
                {...register("notes")}
              />
            </Stack>

            <Divider>
              <Typography variant="button" sx={{ opacity: 0.7 }}>
                Products List
              </Typography>
            </Divider>

            {/* 2. Items Section - Table Layout */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: "#fafafa" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "120px" }}>
                      Qty
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Item Note</TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", width: "50px" }}
                    ></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell sx={{ width: "60%" }}>
                        {" "}
                        {/* تكبير المساحة للمنتج */}
                        <Controller
                          control={control}
                          name={`items.${index}.product_id`}
                          render={({ field: { onChange, value } }) => (
                            <Autocomplete
                              disabled={!warehouseId}
                              // تأكد أن القائمة تحتوي فقط على المنتجات التي تم جلبها بناءً على warehouseId
                              options={products || []}
                              loading={loadingProducts}
                              // 1. عرض الاسم والكمية فقط (تم حذف SKU)
                              getOptionLabel={(option) => {
                                // 1. البحث عن المنتج في القائمة
                                const product =
                                  products?.find(
                                    (p) => p.id === (option.id || option),
                                  ) || option;

                                // 2. استخراج الكمية بأمان (دعم أكثر من تنسيق للبيانات)
                                const stockRecord = product.warehouse_stock;
                                let qty = 0;

                                if (
                                  Array.isArray(stockRecord) &&
                                  stockRecord.length > 0
                                ) {
                                  qty = stockRecord[0].quantity;
                                } else if (
                                  stockRecord &&
                                  typeof stockRecord === "object"
                                ) {
                                  qty = stockRecord.quantity;
                                }

                                return product?.name
                                  ? `${product.name} (Available: ${qty})`
                                  : "";
                              }}
                              // 2. فلترة البحث بالاسم فقط
                              filterOptions={(options, { inputValue }) => {
                                const normalizedInput =
                                  normalizeText(inputValue);
                                return options.filter((item) =>
                                  normalizeText(item.name).includes(
                                    normalizedInput,
                                  ),
                                );
                              }}
                              isOptionEqualToValue={(option, value) =>
                                option.id === (value?.id || value)
                              }
                              value={
                                products?.find((p) => p.id === value) || null
                              }
                              onChange={(_, newValue) => {
                                onChange(newValue ? newValue.id : "");
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  placeholder={
                                    !warehouseId
                                      ? "Select warehouse..."
                                      : "Search product..."
                                  }
                                  error={!!errors.items?.[index]?.product_id}
                                />
                              )}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          fullWidth
                          size="small"
                          {...register(`items.${index}.quantity`, {
                            valueAsNumber: true,
                            onChange: (e) => {
                              const val = parseFloat(e.target.value);
                              const productId = watch(
                                `items.${index}.product_id`,
                              );
                              const product = products?.find(
                                (p) => p.id === productId,
                              );
                              let available = 0;
                              const stockRecord = product?.warehouse_stock;

                              if (
                                Array.isArray(stockRecord) &&
                                stockRecord.length > 0
                              ) {
                                available = stockRecord[0].quantity;
                              } else if (
                                stockRecord &&
                                typeof stockRecord === "object"
                              ) {
                                available = stockRecord.quantity;
                              }

                              if (val > available) {
                                setStockError({
                                  open: true,
                                  message: `You are trying to sell ${val} units, but only ${available} are available in stock for "${product?.name}".`,
                                });
                                // إرجاع القيمة للحد الأقصى المسموح به تلقائياً (اختياري)
                                setValue(`items.${index}.quantity`, available);
                              }
                            },
                          })}
                          error={!!errors.items?.[index]?.quantity}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Note..."
                          {...register(`items.${index}.notes`)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => remove(index)}
                          color="error"
                          disabled={fields.length === 1}
                          size="small"
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              variant="dashed"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => append({ product_id: "", quantity: 1, notes: "" })}
              sx={{
                alignSelf: "center",
                width: "200px",
                borderStyle: "dashed",
              }}
            >
              Add New Row
            </Button>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: "#fcfcfc" }}>
        <Button onClick={onClose} color="inherit" sx={{ px: 4 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={mutation.isLoading}
          sx={{ px: 4 }}
        >
          {mutation.isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Save Sales Order"
          )}
        </Button>
      </DialogActions>
      <Dialog
        open={stockError.open}
        onClose={() => setStockError({ open: false, message: "" })}
      >
        <DialogTitle sx={{ color: "error.main", fontWeight: "bold" }}>
          Stock Insufficient
        </DialogTitle>
        <DialogContent>
          <Typography>{stockError.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setStockError({ open: false, message: "" })}
            variant="contained"
            color="primary"
          >
            Understand
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
