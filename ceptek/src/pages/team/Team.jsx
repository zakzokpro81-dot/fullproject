import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const rows = [
  { id: 1, model: "iPhone 11", part: "Screen", quality: "Original", brand: "GX", quantity: 2, price: 10 },
  { id: 2, model: "iPhone 12", part: "Battery", quality: "Original", brand: "GX", quantity: 2, price: 10 },
  { id: 3, model: "iPhone 13", part: "Screen", quality: "Original", brand: "GX", quantity: 2, price: 10 },
  { id: 4, model: "iPhone 14", part: "Screen", quality: "Original", brand: "GX", quantity: 2, price: 10 },
  { id: 5, model: "iPhone 15", part: "Screen", quality: "Original", brand: "GX", quantity: 2, price: 10 },
  { id: 6, model: "iPhone 16", part: "Screen", quality: "Original", brand: "GX", quantity: 2, price: 10 },
  { id: 7, model: "iPhone 17", part: "Screen", quality: "Original", brand: "GX", quantity: 2, price: 10 },
];

const columns = [
  { field: "model", headerName: "Model", flex: 1, align: "center", headerAlign: "center" },
  { field: "part", headerName: "Part", flex: 1, align: "center", headerAlign: "center" },
  { field: "quality", headerName: "Quality", flex: 1, align: "center", headerAlign: "center" },
  { field: "brand", headerName: "Brand", flex: 1, align: "center", headerAlign: "center" },
  { field: "quantity", headerName: "Quantity", flex: 1, align: "center", headerAlign: "center" },
  { field: "price", headerName: "Price", flex: 1, align: "center", headerAlign: "center" },
];

export function Team() {
  return (
    <Box sx={{ height: 500, width: "98%", mx: "auto" }}>
      <Typography variant="h5" mb={2}>
        Team Overview
      </Typography>
      <DataGrid rows={rows} columns={columns} />
    </Box>
  );
}
