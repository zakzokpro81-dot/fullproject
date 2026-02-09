import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Autocomplete,
  Container,
  Stack,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import {
  getCategories,
  getProductTypes,
  getWarehouses,
  getAttributes,
  saveBulkProducts,
} from "./product.api";
import { BulkModelAutocomplete } from "./BulkModelAutocomplete";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import InventoryIcon from "@mui/icons-material/Inventory";
import BulkProductTable from "./BulkProductTable";
const SECTION_STYLE = {
  p: 3,
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
  bgcolor: "background.paper",
  width: "100%",
};

const FIELD_PROPS = {
  fullWidth: true,
  size: "small",
  variant: "outlined",
};

export function BulkAddProducts() {
  const { control, watch, setValue } = useForm({
    defaultValues: {
      sellPrice: 0,
      costPrice: 0,
      stock: 0,
      attributes: {},
      description: "",
      warehouse: null,
    },
  });

  const [rows, setRows] = useState([]);
  const [openSaveConfirm, setOpenSaveConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // مراقبة القيم العلوية
  const allValues = watch();
  const watchedAttributes = watch("attributes");
  const watchedCategory = watch("category");
  const watchedProductType = watch("productType");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
  });
  const { data: productTypes } = useQuery({
    queryKey: ["productTypes", watchedCategory?.id],
    queryFn: () => getProductTypes(watchedCategory?.id),
    enabled: !!watchedCategory,
  });
  const { data: attributes } = useQuery({
    queryKey: ["attributes", watchedProductType?.id],
    queryFn: () => getAttributes(watchedProductType?.id),
    enabled: !!watchedProductType,
  });

  useEffect(() => {
    setValue("productType", null);
  }, [watchedCategory, setValue]);

  // --- منطق الحماية المستخلص من المثال ---
  const getUpdatedProtectionList = (oldRow, newRow) => {
    const edited = [...(oldRow.manuallyEditedFields || [])];
    const fields = [
      "sell_price",
      "cost_price",
      "stock",
      "description",
      "warehouse_name",
    ];

    fields.forEach((f) => {
      if (newRow[f] !== oldRow[f] && !edited.includes(f)) edited.push(f);
    });

    if (newRow.attributes) {
      Object.keys(newRow.attributes).forEach((slug) => {
        const key = `attr_${slug}`;
        if (
          newRow.attributes[slug] !== oldRow.attributes?.[slug] &&
          !edited.includes(key)
        ) {
          edited.push(key);
        }
      });
    }
    return edited;
  };

  // --- المزامنة التلقائية (المنطق المحمي) ---
  useEffect(() => {
    if (rows.length === 0) return;

    const topAttrs = {};
    if (watchedAttributes) {
      Object.entries(watchedAttributes).forEach(([k, v]) => {
        topAttrs[k] = v && typeof v === "object" ? (v.value ?? v.id) : v;
      });
    }

    setRows((prev) =>
      prev.map((row) => {
        const edited = row.manuallyEditedFields || [];
        const newRow = { ...row };

        if (!edited.includes("sell_price"))
          newRow.sell_price = Number(allValues.sellPrice);
        if (!edited.includes("cost_price"))
          newRow.cost_price = Number(allValues.costPrice);
        if (!edited.includes("stock")) newRow.stock = Number(allValues.stock);
        if (!edited.includes("description"))
          newRow.description = allValues.description || "";
        if (!edited.includes("warehouse_name")) {
          newRow.warehouse_name = allValues.warehouse?.name || "";
          newRow.warehouse_id = allValues.warehouse?.id || null;
        }

        const mergedAttrs = { ...(row.attributes || {}) };
        Object.keys(topAttrs).forEach((slug) => {
          if (!edited.includes(`attr_${slug}`))
            mergedAttrs[slug] = topAttrs[slug];
        });
        newRow.attributes = mergedAttrs;

        return newRow;
      }),
    );
  }, [
    JSON.stringify(watchedAttributes),
    allValues.sellPrice,
    allValues.costPrice,
    allValues.stock,
    allValues.description,
    allValues.warehouse,
  ]);

  // --- وظائف الصاعقة كسر الحماية ---
  const applyFieldToAll = (fieldName) => {
    setRows((prev) =>
      prev.map((row) => {
        const up = {};
        let pKey = fieldName;
        if (fieldName === "sellPrice") {
          up.sell_price = Number(allValues.sellPrice);
          pKey = "sell_price";
        }
        if (fieldName === "costPrice") {
          up.cost_price = Number(allValues.costPrice);
          pKey = "cost_price";
        }
        if (fieldName === "stock") {
          up.stock = Number(allValues.stock);
          pKey = "stock";
        }
        if (fieldName === "description") {
          up.description = allValues.description;
          pKey = "description";
        }
        if (fieldName === "warehouse") {
          up.warehouse_name = allValues.warehouse?.name || "";
          up.warehouse_id = allValues.warehouse?.id || null;
          pKey = "warehouse_name";
        }
        return {
          ...row,
          ...up,
          manuallyEditedFields: (row.manuallyEditedFields || []).filter(
            (f) => f !== pKey,
          ),
        };
      }),
    );
  };

  const applyAttributeToAll = (slug) => {
    const val = watchedAttributes?.[slug];
    const clean = val && typeof val === "object" ? (val.value ?? val.id) : val;
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        attributes: { ...(row.attributes || {}), [slug]: clean },
        manuallyEditedFields: (row.manuallyEditedFields || []).filter(
          (f) => f !== `attr_${slug}`,
        ),
      })),
    );
  };

  const handleInsertBulk = useCallback(
    (selectedModels) => {
      // 1. تحضير السمات العلوية الحالية
      const topAttrs = {};
      if (watchedAttributes) {
        Object.entries(watchedAttributes).forEach(([k, v]) => {
          topAttrs[k] = v && typeof v === "object" ? (v.value ?? v.id) : v;
        });
      }

      // 2. إنشاء الصفوف مع حقن القيم العلوية مباشرة
      const newEntries = selectedModels.map((model) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: model.label,
        part_name: watchedProductType?.name || "",
        // حقن القيم العلوية هنا يضمن ظهورها فوراً عند الإدراج
        warehouse_name: allValues.warehouse?.name || "",
        warehouse_id: allValues.warehouse?.id || null,
        sell_price: Number(allValues.sellPrice) || 0,
        cost_price: Number(allValues.costPrice) || 0,
        stock: Number(allValues.stock) || 0,
        description: allValues.description || "",
        attributes: { ...topAttrs }, // استخدام السمات المعالجة
        manuallyEditedFields: [], // تبدأ فارغة لتسمح للمزامنة اللاحقة بالعمل
      }));

      setRows((prev) => [...prev, ...newEntries]);
    },
    [watchedProductType, allValues, watchedAttributes],
  ); // تأكد من إضافة الاعتمادات هنا

  const handleRowUpdate = (newRow, oldRow) => {
    const edited = getUpdatedProtectionList(oldRow, newRow);
    const updated = { ...newRow, manuallyEditedFields: edited };
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleSaveAll = async () => {
    // 1. تحقق من وجود بيانات
    if (rows.length === 0) {
      alert("لا توجد منتجات لحفظها");
      return;
    }

    // اختياري: إضافة حالة تحميل (Loading)
    // setIsSaving(true);

    try {
      // 2. استدعاء دالة الحفظ الجماعي التي أنشأناها للسوبابيس
      // نمرر لها مصفوفة الصفوف (rows) مباشرة
      const result = await saveBulkProducts(rows);

      if (result) {
        // 3. في حال النجاح:
        alert(`تم حفظ ${rows.length} منتج بنجاح!`);

        // مسح الجدول بعد الحفظ الناجح
        setRows([]);

        // اختياري: إعادة تعيين قيم الفورم العلوية
        // reset();
      }
    } catch (error) {
      // 4. معالجة الأخطاء
      console.error("Failed to save products:", error);
      alert("حدث خطأ أثناء الحفظ: " + (error.message || "خطأ غير معروف"));
    } finally {
      // setIsSaving(false);
    }
  };

  const handleRequestSave = () => {
    if (rows.length === 0) {
      alert("لا توجد منتجات لحفظها");
      return;
    }
    setOpenSaveConfirm(true); // نفتح الديالوغ بدل الحفظ المباشر
  };
  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveBulkProducts(rows);
      if (result) {
        // هنا يمكنك إضافة Snackbar للنجاح بدلاً من الـ alert
        setRows([]);
        setOpenSaveConfirm(false);
      }
    } catch (error) {
      console.error("Failed to save products:", error);
      alert("حدث خطأ أثناء الحفظ: " + (error.message || "خطأ غير معروف"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 6, backgroundColor: "#fcfcfd", minHeight: "100vh" }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight="800" letterSpacing="-0.5px">
            Mass Entry Portal
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Efficiency at scale
          </Typography>
        </Box>
        <InventoryIcon
          sx={{ fontSize: 40, color: "primary.main", opacity: 0.8 }}
        />
      </Stack>

      <Stack spacing={3}>
        <Paper sx={SECTION_STYLE}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2.5}>
            1. Classification
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={categories || []}
                  getOptionLabel={(o) => o?.name || ""}
                  onChange={(_, v) => field.onChange(v)}
                  renderInput={(p) => (
                    <TextField {...p} {...FIELD_PROPS} label="Main Category" />
                  )}
                />
              )}
            />
            <Controller
              name="productType"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  disabled={!watchedCategory}
                  options={productTypes || []}
                  getOptionLabel={(o) => o?.name || ""}
                  onChange={(_, v) => field.onChange(v)}
                  renderInput={(p) => (
                    <TextField {...p} {...FIELD_PROPS} label="Product Type" />
                  )}
                />
              )}
            />
          </Stack>
        </Paper>

        {watchedProductType && attributes && (
          <Paper sx={SECTION_STYLE}>
            <Typography variant="subtitle1" fontWeight="bold" mb={3}>
              2. Specification Overrides
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {attributes.map((attr) => (
                <Box
                  key={attr.id}
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "calc(50% - 16px)",
                      md: "calc(25% - 16px)",
                    },
                  }}
                >
                  <Controller
                    name={`attributes.${attr.slug}`}
                    control={control}
                    render={({ field }) =>
                      attr.has_options ? (
                        <Autocomplete
                          options={attr.options || []}
                          getOptionLabel={(o) => o.value}
                          onChange={(_, v) => field.onChange(v)}
                          renderInput={(p) => (
                            <TextField
                              {...p}
                              {...FIELD_PROPS}
                              label={attr.name}
                              InputProps={{
                                ...p.InputProps,
                                endAdornment: (
                                  <>
                                    {p.InputProps.endAdornment}
                                    <InputAdornment position="end">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() =>
                                          applyAttributeToAll(attr.slug)
                                        }
                                      >
                                        <FlashOnIcon fontSize="small" />
                                      </IconButton>
                                    </InputAdornment>
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      ) : (
                        <TextField
                          {...field}
                          {...FIELD_PROPS}
                          label={attr.name}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => applyAttributeToAll(attr.slug)}
                                >
                                  <FlashOnIcon fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )
                    }
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        <Paper sx={SECTION_STYLE}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2.5}>
            3. Bulk Model Selection
          </Typography>
          <BulkModelAutocomplete
            disabled={!watchedProductType}
            onSelectBulk={handleInsertBulk}
          />
        </Paper>

        <Paper sx={SECTION_STYLE}>
          <Typography variant="subtitle1" fontWeight="bold" mb={3}>
            4. Universal Product Values
          </Typography>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {["sellPrice", "costPrice", "stock"].map((name) => (
                <Controller
                  key={name}
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      {...FIELD_PROPS}
                      type="number"
                      label={
                        name === "sellPrice"
                          ? "Selling Price"
                          : name === "costPrice"
                            ? "Cost Price"
                            : "Opening Stock"
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => applyFieldToAll(name)}
                            >
                              <FlashOnIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              ))}
            </Stack>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Controller
                  name="warehouse"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={warehouses || []}
                      getOptionLabel={(o) => o.name || ""}
                      onChange={(_, v) => field.onChange(v)}
                      renderInput={(p) => (
                        <TextField
                          {...p}
                          {...FIELD_PROPS}
                          label="Target Warehouse"
                          InputProps={{
                            ...p.InputProps,
                            endAdornment: (
                              <>
                                {p.InputProps.endAdornment}
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => applyFieldToAll("warehouse")}
                                  >
                                    <FlashOnIcon fontSize="small" />
                                  </IconButton>
                                </InputAdornment>
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: 2 }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      {...FIELD_PROPS}
                      label="General Notes"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => applyFieldToAll("description")}
                            >
                              <FlashOnIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Stack>
          </Stack>
        </Paper>

        <Box>
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, overflow: "hidden" }}
          >
            <BulkProductTable
              rows={rows}
              warehouses={warehouses}
              attributes={attributes}
              onRowUpdate={handleRowUpdate}
              setRows={setRows}
            />
          </Paper>
        </Box>
      </Stack>

      <Box
        sx={{
          position: "sticky",
          bottom: 24,
          mt: 4,
          display: "flex",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={handleSaveAll}
          disabled={rows.length === 0}
          sx={{ px: 10, py: 2, borderRadius: 50, fontWeight: "bold" }}
        >
          Save All ({rows.length})
        </Button>
      </Box>
    </Container>
  );
}
