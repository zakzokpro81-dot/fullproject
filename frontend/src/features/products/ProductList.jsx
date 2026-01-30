import { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Stack,
} from "@mui/material";
import {
    DataGrid, GridToolbar, GridToolbarContainer,
    GridToolbarQuickFilter,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarExport,
} from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
    getProducts,
    updateProduct,
    deleteProduct,
    deleteProducts,
    createProductWithStock, // ✅ بدل createProduct
} from "./product.api";

import { productColumns } from "./product.columns";
import ProductForm from "./ProductForm";

export function ProductsList() {
    const queryClient = useQueryClient();
    const [selectedIds, setSelectedIds] = useState([]);

    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const { data: products = [], isLoading } = useQuery({
        queryKey: ["products"],
        queryFn: getProducts,
    });

    // CREATE
    const createMutation = useMutation({
        mutationFn: createProductWithStock, // ✅ هنا التعديل المهم
        onSuccess: () => {
            queryClient.invalidateQueries(["products"]);
            setOpenFormDialog(false);
        },
    });

    // UPDATE
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["products"]);
            setOpenFormDialog(false);
            setSelectedProduct(null);
        },
    });

    // DELETE
    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries(["products"]);
            setOpenDeleteDialog(false);
            setSelectedProduct(null);
        },
    });

    const handleAddClick = () => {
        setSelectedProduct(null);
        setOpenFormDialog(true);
    };

    const handleEditClick = (product) => {
        setSelectedProduct(product);
        setOpenFormDialog(true);
    };

    const handleDeleteClick = (product) => {
        setSelectedProduct(product);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = () => {
        deleteMutation.mutate(selectedProduct.id);
    };

    const handleFormSubmit = (data) => {
        if (selectedProduct) {
            //  console.log("data is ", data)
            updateMutation.mutate({ id: selectedProduct.id, data });
        } else {
            createMutation.mutate(data); // ✅ الآن يدخل product + warehouse_stock
        }
    };

    function ToolbarWithDelete({ selectedIds = [], onDeleteSelected }) {
        return (
            <GridToolbarContainer
                sx={{
                    justifyContent: "space-between",
                    width: "100%",
                    alignItems: "center",
                }}
            >

                <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                        color="error"
                        variant="contained"
                        size="small"
                        disabled={selectedIds.length === 0}
                        onClick={onDeleteSelected}
                    >
                        Delete Selected ({selectedIds.length})
                    </Button>
                    <GridToolbarColumnsButton />
                    <GridToolbarFilterButton />
                    <GridToolbarExport />
                    <GridToolbarQuickFilter />


                </Stack>
            </GridToolbarContainer>
        );
    }
const handleDeleteSelected = async () => {
  try {
    const idsArray = Array.from(selectedIds.ids);

    console.log("Deleting IDs:", idsArray);

    await deleteProducts(idsArray);

    queryClient.invalidateQueries(["products"]);
    setSelectedIds({ type: "include", ids: new Set() });
  } catch (err) {
    console.error("DELETE ERROR:", err);
  }
};




    return (
        <Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h5">Products</Typography>
                <Button variant="contained" onClick={handleAddClick}>
                    Add Product
                </Button>
            </Box>

            <DataGrid
                rows={products}
                columns={productColumns(handleEditClick, handleDeleteClick)}
                loading={isLoading}
                autoHeight
                //   pagelength={10}
                disableRowSelectionOnClick
                sx={{ width: "100%" }}
                checkboxSelection
                showToolbar
                onRowSelectionModelChange={(newSelection) => {
                    setSelectedIds(newSelection);
                }}

                slots={{ toolbar: ToolbarWithDelete }}
                slotProps={{
                    toolbar: {
                        selectedIds,
                        onDeleteSelected: handleDeleteSelected,
                    },
                }}


            />

            <ProductForm
                open={openFormDialog}
                onClose={() => setOpenFormDialog(false)}
                onSubmit={handleFormSubmit}
                defaultValues={selectedProduct}
            />

            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Confirm</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this product?{" "}
                    <strong>{selectedProduct?.name}</strong>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleDeleteConfirm}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
