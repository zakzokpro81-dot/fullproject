import React, { useState } from "react";
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
    getProductTypes,
    createProductType,
    updateProductType,
    deleteProductType,
} from "./productType.api";

import { productTypeColumns } from "./productType.columns";
import ProductTypeForm from "./ProductTypeForm";

export  function ProductTypeList() {
    const queryClient = useQueryClient();

    const [openForm, setOpenForm] = useState(false);
    const [editingProductType, setEditingProductType] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProductType, setSelectedProductType] = useState(null);

    // Query
    const { data: productTypes = [], isLoading } = useQuery({
        queryKey: ["productTypes"],
        queryFn: getProductTypes,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createProductType,
        onSuccess: () => {
            queryClient.invalidateQueries(["productTypes"]);
            handleCloseForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateProductType,
        onSuccess: () => {
            queryClient.invalidateQueries(["productTypes"]);
            handleCloseForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProductType,
        onSuccess: () => {
            queryClient.invalidateQueries(["productTypes"]);
            handleCloseDeleteDialog();
        },
    });

    // Handlers
    const handleOpenAdd = () => {
        setEditingProductType(null);
        setOpenForm(true);
    };

    const handleEdit = (productType) => {
        setEditingProductType(productType);
        setOpenForm(true);
    };

    const handleDelete = (productType) => {
        setSelectedProductType(productType);
        setDeleteDialogOpen(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
        setEditingProductType(null);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedProductType(null);
    };

    const handleFormSubmit = (data) => {
        if (editingProductType) {
            updateMutation.mutate({ id: editingProductType.id, ...data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleConfirmDelete = () => {
        if (selectedProductType) {
            deleteMutation.mutate(selectedProductType.id);
        }
    };

    return (
        <Box sx={{ height: 600, width: "100%" }}>
            <Typography variant="h5" mb={2}>
                Product Types
            </Typography>

            <Button variant="contained" onClick={handleOpenAdd} sx={{ mb: 2 }}>
                Add Product Type
            </Button>

            <DataGrid
                rows={productTypes}
                columns={productTypeColumns(handleEdit, handleDelete)}
                loading={isLoading}
                getRowId={(row) => row.id}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: { quickFilterAlwaysVisible: true },
                }}
                sx={{ width: "100%" }}
            />

            {/* Form Dialog */}
            <ProductTypeForm
                open={openForm}
                onClose={handleCloseForm}
                onSubmit={handleFormSubmit}
                defaultValues={editingProductType}
                isEditing={!!editingProductType}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete product type:{" "}
                        <strong>{selectedProductType?.name}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button color="error" onClick={handleConfirmDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
