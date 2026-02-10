import React, { useState } from "react";
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
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
    getProductTypeAttributes,
    createProductTypeAttribute,
    updateProductTypeAttribute,
    deleteProductTypeAttribute,
} from "./productTypeAttributes.api";

import { productTypeAttributesColumns } from "./productTypeAttributes.columns";
import ProductTypeAttributesForm from "./ProductTypeAttributesForm";

export  function ProductTypeAttributesList() {
    const queryClient = useQueryClient();

    const [openForm, setOpenForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const { data = [], isLoading } = useQuery({
        queryKey: ["product_type_attributes"],
        queryFn: getProductTypeAttributes,
    });

    const createMutation = useMutation({
        mutationFn: createProductTypeAttribute,
        onSuccess: () => {
            queryClient.invalidateQueries(["product_type_attributes"]);
            handleCloseForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateProductTypeAttribute,
        onSuccess: () => {
            queryClient.invalidateQueries(["product_type_attributes"]);
            handleCloseForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProductTypeAttribute,
        onSuccess: () => {
            queryClient.invalidateQueries(["product_type_attributes"]);
            handleCloseDeleteDialog();
        },
    });

    const handleOpenAdd = () => {
        setIsEditing(false);
        setSelectedRow(null);
        setOpenForm(true);
    };

    const handleOpenEdit = (row) => {
        setIsEditing(true);
        setSelectedRow(row);
        setOpenForm(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
        setSelectedRow(null);
    };

    const handleOpenDeleteDialog = (row) => {
        setSelectedRow(row);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setSelectedRow(null);
    };

    const handleSubmit = (formData) => {
        if (isEditing) {
            updateMutation.mutate({ id: selectedRow.id, ...formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const columns = productTypeAttributesColumns(
        handleOpenEdit,
        handleOpenDeleteDialog
    );

    return (
        <Box sx={{ width: "100%" }}>
            <Stack direction="row" justifyContent="space-between" mb={2}>
                <Typography variant="h5">Product Type Attributes</Typography>
                <Button variant="contained" onClick={handleOpenAdd}>
                    Add
                </Button>
            </Stack>

            <DataGrid
                rows={data}
                columns={columns}
                loading={isLoading}
                autoHeight
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true } }}
                sx={{ width: "100%" }}
            />

            <ProductTypeAttributesForm
                open={openForm}
                onClose={handleCloseForm}
                onSubmit={handleSubmit}
                isEditing={isEditing}
                defaultValues={
                    selectedRow
                        ? {
                            product_type_id: selectedRow.product_type_id,
                            attribute_id: selectedRow.attribute_id,
                        }
                        : { product_type_id: null, attribute_id: null }
                }
            />

            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this relation?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button
                        color="error"
                        onClick={() => deleteMutation.mutate(selectedRow.id)}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
