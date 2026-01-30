import { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
    getProducts,
    updateProduct,
    deleteProduct,
    createProductWithStock, // ✅ بدل createProduct
} from "./product.api";

import { productColumns } from "./product.columns";
import ProductForm from "./ProductForm";

export function ProductsList() {
    const queryClient = useQueryClient();

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
            updateMutation.mutate({ id: selectedProduct.id, data });
        } else {
            createMutation.mutate(data); // ✅ الآن يدخل product + warehouse_stock
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
                pageSize={10}
                sx={{ width: "100%" }}
                slots={{ toolbar: GridToolbar }}
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
