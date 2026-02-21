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
  Grid,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductActionDialogs from "../../componenets/ProductActionDialogs"; // تأكد من مسار الملف الصحيح
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { ModelAutocomplete } from "./ModelAutocomplete"; // تأكد من المسار
const SECTION_STYLE = {
  p: 3,
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
  bgcolor: "background.paper",
  width: "100%",
};

const fieldStyle = {
  "& .MuiInputBase-root": {
    fontSize: "0.85rem",
    backgroundColor: "#fff",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.85rem",
  },
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
  const [trackingData, setTrackingData] = useState(""); // لتخزين الـ IMEIs كبيانات نصية مؤقتة
  const TRACKING_TYPES = {
    SERIAL: 1, // الرقم التسلسلي / IMEI
    QUANTITY: 2, // الكمية العادية
  };

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
      "imei",
      "serial_number",
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

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: saveBulkProducts,
    onSuccess: () => {
      // نفس الأسطر في ملفك الفردي
      queryClient.invalidateQueries(["products"]);
      setRows([]); // مسح الجدول الجماعي
      setOpenSaveConfirm(false); // إغلاق الديالوغ
      // يمكنك إضافة alert هنا إذا أردت كما في ملفك
    },
    onError: (error) => {
      console.error("Error details:", error);
      alert(`فشل الحفظ: ${error.message || "تأكد من إدخال البيانات المطلوبة"}`);
    },
  });

  const [unitsList, setUnitsList] = useState([{ imei: "", serial_number: "" }]);

  // دالة لإضافة سطر جديد
  const addUnitField = () => {
    setUnitsList([...unitsList, { imei: "", serial_number: "" }]);
  };

  // دالة لتحديث قيمة حقل معين
  const updateUnitField = (index, field, value) => {
    const newUnits = [...unitsList];
    newUnits[index][field] = value;
    setUnitsList(newUnits);
  };

  // دالة لحذف سطر
  const removeUnitField = (index) => {
    setUnitsList(unitsList.filter((_, i) => i !== index));
  };

  const handleConfirmSave = () => {
    const productsData = rows.map((row) => {
      // تقليد منطق الـ API الفردي في استخراج الـ attributes
      const cleanedAttributes = {};

      if (row.attributes) {
        Object.entries(row.attributes).forEach(([slug, val]) => {
          let finalValue = val;

          // --- هذا هو السطر الجوهري الذي يقلد كود الـ API الفردي لديك ---
          if (typeof val === "object" && val !== null && "value" in val) {
            finalValue = val.value;
          }

          // إرسال الحقل فقط إذا كان له قيمة (تجنب الـ null value error)
          if (
            finalValue !== null &&
            finalValue !== undefined &&
            finalValue !== ""
          ) {
            cleanedAttributes[slug] = finalValue;
          }
        });
      }
      return {
        name: row.name || "",
        brand_id: row.brand_id || null,
        model_id: row.model_id || null,
        family_id: row.family_id || null,
        product_type_id: watchedProductType?.id || null,
        category_id: watchedCategory?.id || null,
        sell_price: Number(row.sell_price) || 0,
        cost_price: Number(row.cost_price) || 0,
        stock: Number(row.stock) || 0,
        description: row.description || "",
        warehouse_id: row.warehouse_id || warehouses[0]?.id || null,
        attributes: cleanedAttributes, // ترسل الآن كـ { color: "Red" } وليس كـ { color: {value: "Red"} }

        // داخل handleConfirmSave عند إنشاء المصفوفة:
        units:
          row.imei || row.serial_number
            ? [
                {
                  imei: row.imei || null,
                  serial_number: row.serial_number || null, // إضافة هذا السطر
                  warehouse_id: row.warehouse_id || null,
                  purchase_price: Number(row.cost_price),
                  sell_price: Number(row.sell_price),
                  status: "available",
                },
              ]
            : [],
      };
    });

    mutation.mutate(productsData);
  };
  useEffect(() => {
    if (warehouses && warehouses.length > 0) {
      // تعيين أول مستودع في "الحقول العلوية" تلقائياً
      setValue("warehouse", warehouses[0]);
    }
  }, [warehouses, setValue]);

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
      prev.map((row, index) => {
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
        const correspondingUnit = unitsList[index];

        if (correspondingUnit) {
          if (!edited.includes("imei")) {
            newRow.imei = correspondingUnit.imei;
          }
          if (!edited.includes("serial_number")) {
            newRow.serial_number = correspondingUnit.serial_number;
          }
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
    JSON.stringify(allValues),
    JSON.stringify(unitsList),
    JSON.stringify(watchedAttributes),
  ]);

  const applySpecificFieldToRow = (index, fieldName) => {
    const valueFromTop = unitsList[index]?.[fieldName] || "";

    setRows((prev) => {
      const newRows = [...prev];
      if (newRows[index]) {
        newRows[index] = {
          ...newRows[index],
          [fieldName]: valueFromTop,
          // حذف الحماية عن هذا الحقل في هذا الصف تحديداً
          manuallyEditedFields: (
            newRows[index].manuallyEditedFields || []
          ).filter((f) => f !== fieldName),
        };
      }
      return newRows;
    });
  };

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
        if (fieldName === "imei") {
          up.imei = unitsList[0]?.imei || "";
          pKey = "imei";
        }
        if (fieldName === "serial_number") {
          up.serial_number = unitsList[0]?.serial_number || "";
          pKey = "serial_number";
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

  const handleInsertSingleModel = useCallback(
    (model) => {
      if (!model) return;
      const currentWarehouse = watch("warehouse");

      const topAttrs = {};
      if (watchedAttributes) {
        Object.entries(watchedAttributes).forEach(([k, v]) => {
          topAttrs[k] = v && typeof v === "object" ? (v.value ?? v.id) : v;
        });
      }

      // فلترة السيريالات التي تحتوي على نص
      const validUnits = unitsList.filter(
        (u) => u.imei.trim() || u.serial_number.trim(),
      );
      const unitsToProcess =
        validUnits.length > 0 ? validUnits : [{ imei: "", serial_number: "" }];

      const newEntries = unitsToProcess.map((unit, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: model.label || model.model_name,
        model_id: model.model_id || model.id,
        brand_id: model.brand_id,
        part_name: watchedProductType?.name || "",
        category: watchedCategory,
        productType: watchedProductType,
        imei: unit.imei.trim(),
        serial_number: unit.serial_number.trim(),
        stock: 1, // إجباري 1 في نظام السيريال
        warehouse_name:
          allValues.warehouse?.name || currentWarehouse?.name || "",
        warehouse_id: allValues.warehouse?.id || currentWarehouse?.id || null,
        sell_price: Number(allValues.sellPrice) || 0,
        cost_price: Number(allValues.costPrice) || 0,
        description: allValues.description || "",
        attributes: { ...topAttrs },
        manuallyEditedFields: [],
        unitIndex: validUnits.length > 0 ? unitsList.indexOf(unit) : 0,
      }));

      setRows((prev) => [...prev, ...newEntries]);
    },
    [
      watchedProductType,
      watchedCategory,
      allValues,
      watchedAttributes,
      unitsList,
      watch,
    ],
  );

  const handleInsertBulk = useCallback(
    (selectedModels) => {
      const currentWarehouse = watch("warehouse");

      // 1. تحضير السمات (Attributes) العلوية

      const topAttrs = {};

      if (watchedAttributes) {
        Object.entries(watchedAttributes).forEach(([k, v]) => {
          topAttrs[k] = v && typeof v === "object" ? (v.value ?? v.id) : v;
        });
      }

      const isSerialMode =
        watchedProductType?.tracking_type_id === TRACKING_TYPES.SERIAL;

      const newEntries = [];

      selectedModels.forEach((model) => {
        if (isSerialMode) {
          // نأخذ الوحدات التي تم ملؤها فقط

          const validUnits = unitsList.filter(
            (u) => u.imei.trim() !== "" || u.serial_number.trim() !== "",
          );

          // إذا كانت القائمة فارغة، نضيف سطراً فارغاً واحداً للموديل (للمرونة)

          const unitsToProcess =
            validUnits.length > 0
              ? validUnits
              : [{ imei: "", serial_number: "" }];

          unitsToProcess.forEach((unit) => {
            newEntries.push({
              id: Math.random().toString(36).substr(2, 9),

              name: model.label,

              model_id: model.id,

              brand_id: model.brand_id,

              part_name: watchedProductType?.name || "",

              category: watchedCategory,

              productType: watchedProductType,

              // البيانات المستمدة من قائمة الوحدات العلوية

              imei: unit.imei.trim(),

              serial_number: unit.serial_number.trim(),

              stock: 1,

              warehouse_name:
                allValues.warehouse?.name || currentWarehouse?.name || "",

              warehouse_id:
                allValues.warehouse?.id || currentWarehouse?.id || null,

              sell_price: Number(allValues.sellPrice) || 0,

              cost_price: Number(allValues.costPrice) || 0,

              description: allValues.description || "",

              attributes: { ...topAttrs },

              // --- الجزء الهام للمزامنة ---

              // نترك هذه المصفوفة فارغة عند الإضافة لكي تعتبر الحقول "تابعة" للأب

              // وتتأثر بأي تغيير علوي تلقائياً حتى يقوم المستخدم بتعديل الخلية بنفسه

              manuallyEditedFields: [],
            });
          });
        } else {
          // الوضع العادي (كميات)

          newEntries.push({
            id: Math.random().toString(36).substr(2, 9),

            name: model.label,

            model_id: model.id,

            brand_id: model.brand_id,

            part_name: watchedProductType?.name || "",

            category: watchedCategory,

            productType: watchedProductType,

            imei: null,

            serial_number: null,

            stock: Number(allValues.stock) || 0,

            warehouse_name:
              allValues.warehouse?.name || currentWarehouse?.name || "",

            warehouse_id:
              allValues.warehouse?.id || currentWarehouse?.id || null,

            sell_price: Number(allValues.sellPrice) || 0,

            cost_price: Number(allValues.costPrice) || 0,

            description: allValues.description || "",

            attributes: { ...topAttrs },

            manuallyEditedFields: [],
          });
        }
      });

      setRows((prev) => [...prev, ...newEntries]);
    },

    [
      watchedProductType,

      watchedCategory,

      allValues,

      watchedAttributes,

      unitsList, // ضروري جداً لكي تشعر الدالة بتغيرات الـ IMEI العلوية

      watch,
    ],
  );

  const handleRowUpdate = (newRow, oldRow) => {
    const edited = getUpdatedProtectionList(oldRow, newRow);
    const updated = { ...newRow, manuallyEditedFields: edited };
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleRequestSave = () => {
    if (rows.length === 0) {
      alert("لا توجد منتجات لحفظها");
      return;
    }
    setOpenSaveConfirm(true); // نفتح الديالوغ بدل الحفظ المباشر
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
          <Stack direction="column" spacing={2}>
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

        {/* --- قسم الـ IMEI الديناميكي --- */}
        {/* --- قسم وحدات المنتج الديناميكي --- */}
        {watchedProductType?.tracking_type_id === 3 && (
          <Paper sx={SECTION_STYLE}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 2,
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontWeight: "bold",
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                }}
              />
              Unit Details (IMEI & Serial Numbers)
            </Typography>

            <Stack spacing={2}>
              {unitsList.map((unit, index) => (
                <Grid
                  container
                  spacing={2}
                  key={index}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  {/* حقل IMEI */}
                  <Grid item xs={5}>
                    <TextField
                      {...FIELD_PROPS}
                      label={`IMEI ${index + 1}`}
                      value={unit.imei}
                      onChange={(e) =>
                        updateUnitField(index, "imei", e.target.value)
                      }
                      sx={fieldStyle}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                applySpecificFieldToRow(index, "imei")
                              }
                              title="Force sync this IMEI to the table row below"
                            >
                              <FlashOnIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* حقل Serial Number */}
                  <Grid item xs={5}>
                    <TextField
                      {...FIELD_PROPS}
                      label={`Serial ${index + 1}`}
                      value={unit.serial_number}
                      onChange={(e) =>
                        updateUnitField(index, "serial_number", e.target.value)
                      }
                      sx={fieldStyle}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                applySpecificFieldToRow(index, "serial_number")
                              }
                              title="Force sync this Serial to the table row below"
                            >
                              <FlashOnIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* أزرار الإضافة والحذف */}
                  <Grid item xs={2}>
                    <Stack direction="row" spacing={1}>
                      {index === unitsList.length - 1 && (
                        <IconButton
                          color="primary"
                          onClick={addUnitField}
                          size="small"
                        >
                          <AddCircleIcon />
                        </IconButton>
                      )}
                      {unitsList.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => removeUnitField(index)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              ))}
            </Stack>
          </Paper>
        )}

        {/* لا يظهر هذا القسم إلا بعد اختيار نوع المنتج */}
        {watchedProductType && (
          <Paper sx={SECTION_STYLE}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2.5}>
              3.{" "}
              {watchedProductType?.tracking_type_id === 3
                ? "Model Selection (Single)"
                : "Bulk Model Selection"}
            </Typography>

            {watchedProductType && (
              <Paper sx={SECTION_STYLE}>
                <Typography variant="subtitle1" fontWeight="bold" mb={2.5}>
                  3.{" "}
                  {watchedProductType?.tracking_type_id === 3
                    ? "Model Selection (IMEI Mode)"
                    : "Bulk Model Selection"}
                </Typography>

                {watchedProductType?.tracking_type_id === 3 ? (
                  <ModelAutocomplete
                    key="single-select"
                    value={null}
                    onChange={(model) => handleInsertSingleModel(model)}
                    selectedCategory={watchedCategory}
                    selectedProductType={watchedProductType}
                  />
                ) : (
                  <BulkModelAutocomplete
                    key="bulk-select"
                    onSelectBulk={(models) => handleInsertBulk(models)}
                    selectedCategory={watchedCategory}
                    selectedProductType={watchedProductType}
                  />
                )}
              </Paper>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              {watchedProductType?.tracking_type_id === 3
                ? "Choose one model to apply the IMEI list above to it."
                : "You can select multiple models to add them at once."}
            </Typography>
          </Paper>
        )}

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
          onClick={() => setOpenSaveConfirm(true)}
          disabled={rows.length === 0}
          sx={{ px: 10, py: 2, borderRadius: 50, fontWeight: "bold" }}
        >
          Save All ({rows.length})
        </Button>
      </Box>

      <ProductActionDialogs
        openSaveConfirm={openSaveConfirm}
        setOpenSaveConfirm={setOpenSaveConfirm}
        handleSaveConfirm={handleConfirmSave}
        isSaving={mutation.isPending} // استخدام isPending من الميوتيشن
        rowCount={rows.length}
        // قيم افتراضية لديالوغات الحذف لكي لا يظهر خطأ
        selectedIds={new Set()}
        openDeleteSelectedDialog={false}
        setOpenDeleteSelectedDialog={() => {}}
        openDeleteDialog={false}
        setOpenDeleteDialog={() => {}}
      />
    </Container>
  );
}
