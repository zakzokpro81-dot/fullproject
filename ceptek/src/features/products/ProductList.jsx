import { useState } from "react";
import { Box, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";

import { ProductDetailsDrawer } from "./ProductDetailsDrawer";
import { productColumns } from "./product.columns";
import AddProductForm from "./AddProductForm";
import EditProductForm from "./EditProductForm";
import { ProductsHeader } from "./ProductsHeader";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { useMessageDialog } from "../../hooks/useMessageDialog";
import {
  useProductQuery,
  useProductReferenceData,
  useProductMutations,
} from "./product.hooks";

export function ProductsList() {
  const { t } = useTranslation();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeleteSelectedDialog, setOpenDeleteSelectedDialog] =
    useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [warehouseId, setWarehouseId] = useState("");
  const [typeId, setTypeId] = useState("");

  const { messageDialog, showMessageDialog, closeMessageDialog } =
    useMessageDialog();

  const {
    rows,
    rowCount,
    isLoading,
    isFetching,
    paginationModel,
    setPaginationModel,
    searchText,
    setSearchText,
  } = useProductQuery({ warehouseId, typeId });

  const { warehouses, productTypes } = useProductReferenceData();

  const {
    deactivateSingleMutation,
    deactivateBulkMutation,
    deleteMutation,
    softDeleteMutation,
  } = useProductMutations({
    onSuccess: () => {
      setOpenDeleteDialog(false);
      setOpenDeleteSelectedDialog(false);
      setSelectedProduct(null);
      setSelectedIds(new Set());
    },
    showMessageDialog,
  });

  const handleEditAction = (product) => {
    setSelectedProduct(product);
    setOpenEditDialog(true);
  };

  const handleDeleteAction = (product) => {
    setSelectedProduct(product);
    setOpenDeleteDialog(true);
  };

  const handleDeactivateConfirm = () => {
    if (selectedProduct) {
      deactivateSingleMutation.mutate(selectedProduct.id);
    }
  };

  const handleDeactivateSelectedConfirm = () => {
    if (selectedIds.size > 0) {
      deactivateBulkMutation.mutate(Array.from(selectedIds));
    }
  };

  const handleRowClick = (params) => {
    const fullProductData = rows.find((p) => p.id === params.row.id);
    setSelectedProduct(fullProductData || params.row);
    setDetailDrawerOpen(true);
  };

  const toggleSelectAll = () => {
    const allSelected =
      rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
    setSelectedIds(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
  };

  const columns = productColumns(
    handleEditAction,
    handleDeleteAction,
    selectedIds,
    toggleSelect,
    rows,
    toggleSelectAll,
    t,
  );

  const handlePaginationChange = (model) => {
    setPaginationModel(model);
    setSelectedIds(new Set());
  };

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
        handleAddClick={() => setOpenAddDialog(true)}
      />

      <Paper sx={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={rows}
          rowCount={rowCount}
          loading={isLoading || isFetching}
          columns={columns}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          disableRowSelectionOnClick
          onRowClick={handleRowClick}
        />
      </Paper>

      <ProductDetailsDrawer
        detailDrawerOpen={detailDrawerOpen}
        setDetailDrawerOpen={setDetailDrawerOpen}
        selectedProduct={selectedProduct}
      />

      {/* Single delete confirmation */}
      <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeactivateConfirm}
        title="Deactivate Product"
        message={`Are you sure you want to deactivate "${selectedProduct?.name}"?`}
      />

      {/* Bulk delete confirmation */}
      <ConfirmDeleteDialog
        open={openDeleteSelectedDialog}
        onClose={() => setOpenDeleteSelectedDialog(false)}
        onConfirm={handleDeactivateSelectedConfirm}
        title="Deactivate Selected Products"
        message={`Are you sure you want to deactivate ${selectedIds.size} selected product(s)?`}
      />

      {openAddDialog && (
        <AddProductForm
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          showSnackbar={showMessageDialog}
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
          showSnackbar={showMessageDialog}
        />
      )}

      <MessageDialog {...messageDialog} onClose={closeMessageDialog} />
      <ScrollToTopButton />
    </Box>
  );
}
