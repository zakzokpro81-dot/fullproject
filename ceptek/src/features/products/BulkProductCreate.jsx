// src/pages/BulkProductGrid.jsx
import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import  supabase  from "../../config/supabase";

// نفس دالة الفورم
const normalizeTurkishText = (text) => {
  return text
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u");
};

export  function BulkProductCreate() {
  const [modelSearch, setModelSearch] = useState("");
  const [rows, setRows] = useState([]);

  const [globalPrice, setGlobalPrice] = useState("");
  const [globalCost, setGlobalCost] = useState("");
  const [globalQuantity, setGlobalQuantity] = useState("");

  // نفس منطق الفورم السابق
  const fetchModels = async () => {
    if (!modelSearch) return;

    const search = normalizeTurkishText(modelSearch);

    const { data, error } = await supabase
      .from("models")
      .select("id, name")
      .ilike("normalized_name", `%${search}%`);

    if (error) {
      console.error(error);
      return;
    }

    const mapped = data.map((m) => ({
      id: m.id,
      model_name: m.name,
      price: globalPrice,
      cost: globalCost,
      quantity: globalQuantity,
    }));

    setRows(mapped);
  };

  // نسخ القيم إلى الصفوف
  const syncToRows = (field, value) => {
    if (field === "price") setGlobalPrice(value);
    if (field === "cost") setGlobalCost(value);
    if (field === "quantity") setGlobalQuantity(value);

    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        [field]: value,
      }))
    );
  };

  const handleSave = async () => {
    if (rows.length === 0) return alert("لا يوجد بيانات");

    const payload = rows.map((row) => ({
      model_id: row.id,
      price: Number(row.price),
      cost: Number(row.cost),
      quantity: Number(row.quantity),
    }));

    const { error } = await supabase.from("products").insert(payload);

    if (error) {
      console.error(error);
      alert("خطأ أثناء الحفظ");
    } else {
      alert("تم حفظ جميع المنتجات");
      setRows([]);
    }
  };

  const columns = [
    { field: "model_name", headerName: "Model", flex: 2 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "cost", headerName: "Cost", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
  ];

  return (
    <Box p={3}>
      <Typography variant="h6" mb={2}>
        Bulk Product Insert
      </Typography>

      {/* صف الإدخال الرئيسي */}
      <Box display="grid" gridTemplateColumns="2fr 1fr 1fr 1fr" gap={2} mb={2}>
        <TextField
          label="Model"
          value={modelSearch}
          onChange={(e) => setModelSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchModels();
          }}
        />

        <TextField
          label="Price"
          value={globalPrice}
          onChange={(e) => syncToRows("price", e.target.value)}
        />

        <TextField
          label="Cost"
          value={globalCost}
          onChange={(e) => syncToRows("cost", e.target.value)}
        />

        <TextField
          label="Quantity"
          value={globalQuantity}
          onChange={(e) => syncToRows("quantity", e.target.value)}
        />
      </Box>

      {/* Grid النتائج */}
      <Paper sx={{ height: 400 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { quickFilterAlwaysVisible: true } }}
          sx={{ width: "100%" }}
        />
      </Paper>

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleSave}
      >
        Save All
      </Button>
    </Box>
  );
}
