import { useState, useEffect, useCallback } from "react";
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
import { Snackbar, Alert } from "@mui/material";
import { useSnackbar } from "../../hooks/useSnackbar";
import ProductActionDialogs from "../../components/ProductActionDialogs";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { ModelAutocomplete } from "./ModelAutocomplete";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

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
  const [trackingData, setTrackingData] = useState(""); // Temp IMEI text storage
  const TRACKING_TYPES = {
    SERIAL: 1, // Serial / IMEI
    QUANTITY: 2, // Quantity mode
  };
  const [unitsList, setUnitsList] = useState([{ imei: "", serial_number: "" }]);

  const [rows, setRows] = useState([]);
  const [openSaveConfirm, setOpenSaveConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Watch top-level values
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
  // Auto-sync table rows when IMEI/Serial fields change
  useEffect(() => {
    if (watchedProductType?.tracking_type_id === 3 && rows.length > 0) {
      setRows((prevRows) => {
        return prevRows.map((row, index) => {
          // If matching unit data exists for this row index
          if (unitsList[index]) {
            const updatedRow = { ...row };
            const manuallyEdited = row.manuallyEditedFields || [];

            // Skip IMEI if manually edited in table (protected)
            if (!manuallyEdited.includes("imei")) {
              updatedRow.imei = unitsList[index].imei;
            }

            // Skip Serial if manually edited (protected)
            if (!manuallyEdited.includes("serial_number")) {
              updatedRow.serial_number = unitsList[index].serial_number;
            }

            return updatedRow;
          }
          return row;
        });
      });
    }
  }, [unitsList, watchedProductType?.tracking_type_id]);

  useEffect(() => {
    setValue("productType", null);
  }, [watchedCategory, setValue]);

  useEffect(() => {
    if (warehouses && warehouses.length > 0) {
      // Auto-assign first warehouse
      setValue("warehouse", warehouses[0]);
    }
  }, [warehouses, setValue]);

  // --- Auto-sync (protected field logic) ---
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

  // --- Field protection logic ---
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
      queryClient.invalidateQueries(["products"]);
      setRows([]);
      setOpenSaveConfirm(false);
    },
    onError: (error) => {
      showSnackbar(
        `Save failed: ${error.message || "Please check the required fields"}`,
        "error",
      );
    },
  });

  // Add a new unit row
  const addUnitField = () => {
    // 1. Add empty field to top-level list
    setUnitsList((prev) => [...prev, { imei: "", serial_number: "" }]);
    // 2. If rows already exist, clone first row as template
    if (rows.length > 0) {
      const templateRow = rows[0];
      const newBlankRow = {
        ...templateRow,
        id: Math.random().toString(36).substr(2, 9),
        imei: "",
        serial_number: "",
        manuallyEditedFields: [],
      };
      setRows((prevRows) => [...prevRows, newBlankRow]);
    }
  };

  // Update a specific unit field
  const updateUnitField = (index, field, value) => {
    const newUnits = [...unitsList];
    newUnits[index][field] = value;
    setUnitsList(newUnits);
  };

  // Remove a unit row
  const removeUnitField = (index) => {
    // Remove from top-level list
    const updatedUnits = unitsList.filter((_, i) => i !== index);
    setUnitsList(updatedUnits);

    // Remove corresponding table row
    setRows((prevRows) => prevRows.filter((_, i) => i !== index));
  };

  const ACCORDION_STYLE = {
    borderRadius: "8px !important",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
    "&:before": { display: "none" },
  };

  const applySpecificFieldToRow = (index, fieldName) => {
    const valueFromTop = unitsList[index]?.[fieldName] || "";

    setRows((prev) => {
      const newRows = [...prev];
      if (newRows[index]) {
        newRows[index] = {
          ...newRows[index],
          [fieldName]: valueFromTop,
          // Remove field protection for this specific row
          manuallyEditedFields: (
            newRows[index].manuallyEditedFields || []
          ).filter((f) => f !== fieldName),
        };
      }
      return newRows;
    });
  };

  // --- Force-apply (break protection) helpers ---
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

      // Filter units that have content
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
        family_id: model.family_id || null,
        part_name: watchedProductType?.name || "",
        category: watchedCategory,
        productType: watchedProductType,
        imei: unit.imei.trim(),
        serial_number: unit.serial_number.trim(),
        stock: 1, // Fixed at 1 for serial tracking mode
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

      // 1. Prepare top-level attributes

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
          // Only take filled units

          const validUnits = unitsList.filter(
            (u) => u.imei.trim() !== "" || u.serial_number.trim() !== "",
          );

          // If empty, add one blank row for flexibility

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

              family_id: model.family_id || null,

              part_name: watchedProductType?.name || "",

              category: watchedCategory,

              productType: watchedProductType,

              // Data derived from the top-level unit list

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

              // --- Sync: leave empty so fields inherit from parent ---
              // Fields stay synced until user manually edits in table

              manuallyEditedFields: [],
            });
          });
        } else {
          // Standard quantity mode

          newEntries.push({
            id: Math.random().toString(36).substr(2, 9),

            name: model.label,

            model_id: model.id,

            brand_id: model.brand_id,

            family_id: model.family_id || null,

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

      unitsList, // Required for IMEI changes awareness

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
      showSnackbar("No products to save", "warning");
      return;
    }
    setOpenSaveConfirm(true);
  };

  const handleConfirmSave = () => {
    const productsData = rows.map((row) => {
      // Extract and clean attributes for API submission
      const cleanedAttributes = {};

      if (row.attributes) {
        Object.entries(row.attributes).forEach(([slug, val]) => {
          let finalValue = val;

          // Unwrap object values to plain values
          if (typeof val === "object" && val !== null && "value" in val) {
            finalValue = val.value;
          }

          // Only send fields with actual values (avoid null value error)
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
        part_name: row.part_name || "",
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
        attributes: cleanedAttributes,

        units:
          row.imei || row.serial_number
            ? [
                {
                  imei: row.imei || null,
                  serial_number: row.serial_number || null,
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

      <Stack spacing={1.5}>
        {/* 1. Classification Accordion */}
        <Accordion defaultExpanded sx={ACCORDION_STYLE}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">
              1. Classification
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
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
                      <TextField
                        {...p}
                        {...FIELD_PROPS}
                        label="Main Category"
                      />
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
          </AccordionDetails>
        </Accordion>

        {/* 2. Specification Overrides Accordion */}
        {watchedProductType && attributes && (
          <Accordion sx={ACCORDION_STYLE}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">
                2. Specification Overrides
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
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
                                    onClick={() =>
                                      applyAttributeToAll(attr.slug)
                                    }
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
            </AccordionDetails>
          </Accordion>
        )}

        {/* Dynamic IMEI/Serial Section Accordion */}
        {watchedProductType?.tracking_type_id === 3 && (
          <Accordion sx={ACCORDION_STYLE}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                variant="subtitle2"
                sx={{ color: "primary.main", fontWeight: "bold" }}
              >
                Unit Details (IMEI & Serial Numbers)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {unitsList.map((unit, index) => (
                  <Grid
                    container
                    spacing={2}
                    key={index}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Grid item xs={5}>
                      <TextField
                        {...FIELD_PROPS}
                        label={`IMEI ${index + 1}`}
                        value={unit.imei}
                        onChange={(e) =>
                          updateUnitField(index, "imei", e.target.value)
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  applySpecificFieldToRow(index, "imei")
                                }
                                title="Force sync this IMEI"
                              >
                                <FlashOnIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        {...FIELD_PROPS}
                        label={`Serial ${index + 1}`}
                        value={unit.serial_number}
                        onChange={(e) =>
                          updateUnitField(
                            index,
                            "serial_number",
                            e.target.value,
                          )
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  applySpecificFieldToRow(
                                    index,
                                    "serial_number",
                                  )
                                }
                                title="Force sync this Serial"
                              >
                                <FlashOnIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
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
            </AccordionDetails>
          </Accordion>
        )}

        {/* 3. Model Selection Accordion */}
        {watchedProductType && (
          <Accordion defaultExpanded sx={ACCORDION_STYLE}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">
                3.{" "}
                {watchedProductType?.tracking_type_id === 3
                  ? "Model Selection (IMEI Mode)"
                  : "Bulk Model Selection"}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
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
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {watchedProductType?.tracking_type_id === 3
                  ? "Choose one model to apply the IMEI list above to it."
                  : "You can select multiple models to add them at once."}
              </Typography>
            </AccordionDetails>
          </Accordion>
        )}

        {/* 4. Universal Values Accordion */}
        <Accordion sx={ACCORDION_STYLE}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">
              4. Universal Product Values
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
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
                                      onClick={() =>
                                        applyFieldToAll("warehouse")
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
          </AccordionDetails>
        </Accordion>

        {/* Table Section - Remains outside Accordion for visibility */}
        <Box sx={{ mt: 2 }}>
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

      {/* Action Button */}
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
        isSaving={mutation.isPending}
        rowCount={rows.length}
        selectedIds={new Set()}
        openDeleteSelectedDialog={false}
        setOpenDeleteSelectedDialog={() => {}}
        openDeleteDialog={false}
        setOpenDeleteDialog={() => {}}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
