import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  Drawer,
  Divider,
  Stack,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CloseIcon from "@mui/icons-material/Close";
import { ProductDetailsDrawer } from "./ProductDetailsDrawer";
import {
  getProducts,
  deleteProduct,
  getWarehouses,
  getProductTypes,
  deleteProducts,
} from "./product.api";
import { productColumns } from "./product.columns";
import AddProductForm from "./AddProductForm";
import EditProductForm from "./EditProductForm";
import { ProductsHeader } from "./ProductsHeader";
import ProductActionDialogs from "./ProductActionDialogs";
function normalizeTurkish(str = "") {
  return str
    .replace(/İ/g, "I")
    .replace(/I/g, "I")
    .replace(/ı/g, "i")
    .replace(/Ş/g, "S")
    .replace(/ş/g, "s")
    .replace(/Ğ/g, "G")
    .replace(/ğ/g, "g")
    .replace(/Ü/g, "U")
    .replace(/ü/g, "u")
    .replace(/Ö/g, "O")
    .replace(/ö/g, "o")
    .replace(/Ç/g, "C")
    .replace(/ç/g, "c")
    .toLowerCase();
}

export function ProductsList() {
  const queryClient = useQueryClient();

  const [openAddDialog, setOpenAddDialog] = React.useState(false);
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false);
  const [openDeleteSelectedDialog, setOpenDeleteSelectedDialog] =
    React.useState(false);

  const [selectedIds, setSelectedIds] = React.useState(new Set());

  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [searchText, setSearchText] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
  });
  const { data: productTypes = [] } = useQuery({
    queryKey: ["productTypes"],
    queryFn: getProductTypes,
  });

  const [warehouseId, setWarehouseId] = React.useState("");
  const [typeId, setTypeId] = React.useState("");

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "products",
      paginationModel,
      debouncedSearch,
      warehouseId,
      typeId,
    ],
    queryFn: () =>
      getProducts({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: normalizeTurkish(debouncedSearch),
        warehouseId,
        typeId,
      }),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      setOpenDeleteDialog(false);
      setSelectedProduct(null);
    },
  });

  const handleEditAction = (product) => {
    setSelectedProduct(product);
    setOpenEditDialog(true);
  };

  const handleDeleteAction = (product) => {
    setSelectedProduct(product);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProduct) deleteMutation.mutate(selectedProduct.id);
  };

  const handleRowClick = (params) => {
    const fullProductData = data?.data?.find((p) => p.id === params.row.id);
    setSelectedProduct(fullProductData || params.row);
    setDetailDrawerOpen(true);
  };

  const rows = data?.data || [];

  const toggleSelectAll = () => {
    const allSelected =
      rows.length > 0 && rows.every((r) => selectedIds.has(r.id));

    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleDeleteSelected = async () => {
    await deleteProducts(Array.from(selectedIds));
    queryClient.invalidateQueries(["products"]);
    setSelectedIds(new Set());
  };

  const columns = productColumns(
    handleEditAction,
    handleDeleteAction,
    selectedIds,
    toggleSelect,
    rows,
    toggleSelectAll,
  );
  const handleAddClick = () => setOpenAddDialog(true);
  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <ProductsHeader
        selectedIds={selectedIds}
        setOpenDeleteSelectedDialog={setOpenDeleteSelectedDialog}
        setOpenAddDialog={setOpenAddDialog}
        searchText={searchText}
        setSearchText={setSearchText}
        warehouseId={warehouseId}
        setWarehouseId={setWarehouseId}
        typeId={typeId}
        setTypeId={setTypeId}
        warehouses={warehouses}
        productTypes={productTypes}
        handleAddClick={handleAddClick}
      />

      <Paper sx={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={data?.data || []}
          rowCount={data?.count || 0}
          loading={isLoading || isFetching}
          columns={columns}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableSelectionOnClick
          onRowClick={handleRowClick}
        />
      </Paper>

      <ProductDetailsDrawer
        detailDrawerOpen={detailDrawerOpen}
        setDetailDrawerOpen={setDetailDrawerOpen}
        selectedProduct={selectedProduct}
      />

      <ProductActionDialogs
        openDeleteSelectedDialog={openDeleteSelectedDialog}
        setOpenDeleteSelectedDialog={setOpenDeleteSelectedDialog}
        selectedIds={selectedIds}
        handleDeleteSelected={handleDeleteSelected}
        openDeleteDialog={openDeleteDialog}
        setOpenDeleteDialog={setOpenDeleteDialog}
        selectedProduct={selectedProduct}
        handleDeleteConfirm={handleDeleteConfirm}
      />

      {openAddDialog && (
        <AddProductForm
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
        />
      )}
      {openEditDialog && selectedProduct && (
        <EditProductForm
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
    </Box>
  );
}
