import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Autocomplete,
  Paper,
  Typography,
  Dialog ,
  DialogTitle ,
  DialogContent ,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {WarehouseStockForm}  from "./WarehouseStockForm"
import { getWarehouseStock, getWarehouses, getBrands ,updateStockAction} from "./warehouseStock.api";
import { stockColumns } from "./warehouseStock.columns";
import ProductActionDialogs from "../../componenets/ProductActionDialogs";
import ProductDetailsDrawer from "../orders/ProductDetailsDrawer";

export function WarehouseStockList() {
  const [searchText, setSearchText] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

     const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false);
      const [selectedProductId, setSelectedProductId] = React.useState(null);

  const { data: stock = [], isLoading } = useQuery({
    queryKey: ["warehouse_stock"],
    queryFn: getWarehouseStock,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  // داخل WarehouseStockList

const mutation = useMutation({
    mutationFn: updateStockAction,
    onSuccess: (data) => {
        console.log("تم الحفظ بنجاح:", data);
        queryClient.invalidateQueries(["warehouse_stock"]);
        setIsFormOpen(false); // هذا السطر لن يعمل إلا إذا لم يحدث Error في الدالة أعلاه
    },
    onError: (err) => {
        console.error("فشلت العملية:", err);
    }
});


const handleSaveStock = async (data) => {
    // استخدم mutateAsync بدلاً من mutate
    return await mutation.mutateAsync(data);
};


  const filteredRows = useMemo(() => {
    return stock.filter((row) => {
      const matchesSearch =
        row?.products?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        row?.products?.sku?.toLowerCase().includes(searchText.toLowerCase());

      const matchesWarehouse = selectedWarehouse
        ? row?.warehouses?.id === selectedWarehouse.id
        : true;

      const matchesBrand = selectedBrand
        ? row?.products?.brands?.id === selectedBrand.id
        : true;

      return matchesSearch && matchesWarehouse && matchesBrand;
    });
  }, [stock, searchText, selectedWarehouse, selectedBrand]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRows.map((r) => r.id));
    }
  };

  const handleDelete = (row) => {
    setDeleteTarget(row);
  };

  const columns = stockColumns(
    handleDelete,
    selectedIds,
    toggleSelect,
    filteredRows,
    toggleSelectAll
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
      <Typography variant="h5" mb={2}>
        Stock Management
      </Typography>
      <Button variant="contained" onClick={() => setIsFormOpen(true)} >
            Add Stock Movement
          </Button>
          </Stack>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Search"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Autocomplete
            options={warehouses}
            getOptionLabel={(option) => option.name || ""}
            value={selectedWarehouse}
            onChange={(e, value) => setSelectedWarehouse(value)}
            renderInput={(params) => (
              <TextField {...params} label="Warehouse" />
            )}
            sx={{ minWidth: 200 }}
          />

          <Autocomplete
            options={brands}
            getOptionLabel={(option) => option.name || ""}
            value={selectedBrand}
            onChange={(e, value) => setSelectedBrand(value)}
            renderInput={(params) => <TextField {...params} label="Brand" />}
            sx={{ minWidth: 200 }}
          />

          
        </Stack>
      </Paper>

      {/* DataGrid */}
      <Paper sx={{ height: 600 }}>
       <DataGrid
  rows={filteredRows}
  columns={columns}
  loading={isLoading}
  // التعديل هنا 👇
  onRowClick={(params) => {
    // params.row يحتوي على بيانات السطر بالكامل
    // تأكد من مسار المعرف (id) بناءً على بنية البيانات لديك
    const productId = params.row?.products?.id; 
    
    if (productId) {
      setSelectedProductId(productId);
      setDetailDrawerOpen(true);
    }
  }}
  slots={{ toolbar: GridToolbar }}
  slotProps={{
    toolbar: { quickFilterAlwaysVisible: true },
  }}
  sx={{ 
    width: "100%",
    '& .MuiDataGrid-row:hover': { cursor: 'pointer' } // اختيارية: لتحويل الماوس لشكل يد عند التمرير
  }}
/>
      </Paper>

<Dialog 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add / Update Stock</DialogTitle>
        <DialogContent dividers>
          <WarehouseStockForm 
           onSave={(data) => mutation.mutateAsync(data)} 
  defaultValues={{}}
          />
        </DialogContent>
      </Dialog>


      
      {/* Delete Dialog */}
      <ProductActionDialogs
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Stock Item"
        description={`Are you sure you want to delete stock for: ${
          deleteTarget?.products?.name || ""
        }`}
        onConfirm={() => {
          // لاحقاً نربطها بـ mutation
          setDeleteTarget(null);
        }}
      />


      <ProductDetailsDrawer
                      detailDrawerOpen={detailDrawerOpen}
                      setDetailDrawerOpen={setDetailDrawerOpen}
                      selectedProductId={selectedProductId}
                  />


    </Box>
  );
}
