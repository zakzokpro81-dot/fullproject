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

import { getCategories, createCategory, updateCategory, deleteCategory } from "./category.api";
import { categoryColumns } from "./category.columns";
import CategoryForm from "./CategoryForm";

export  function CategoryList() {
    const queryClient = useQueryClient();

    const [openForm, setOpenForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Query
    const { data: categories = [], isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries(["categories"]);
            handleCloseForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateCategory,
        onSuccess: () => {
            queryClient.invalidateQueries(["categories"]);
            handleCloseForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries(["categories"]);
            handleCloseDeleteDialog();
        },
    });

    // Handlers
    const handleOpenAdd = () => {
        setEditingCategory(null);
        setOpenForm(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setOpenForm(true);
    };

    const handleDelete = (category) => {
        setSelectedCategory(category);
        setDeleteDialogOpen(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
        setEditingCategory(null);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
    };

    const handleFormSubmit = (data) => {
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, ...data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleConfirmDelete = () => {
        if (selectedCategory) {
            deleteMutation.mutate(selectedCategory.id);
        }
    };

    return (
        <Box sx={{ height: 600, width: "100%" }}>
            <Typography variant="h5" mb={2}>
                Categories
            </Typography>

            <Button variant="contained" onClick={handleOpenAdd} sx={{ mb: 2 }}>
                Add Category
            </Button>

            <DataGrid
                rows={categories}
                columns={categoryColumns(handleEdit, handleDelete)}
                loading={isLoading}
                getRowId={(row) => row.id}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: { quickFilterAlwaysVisible: true },
                }}
                sx={{ width: "100%" }}
            />

            {/* Form Dialog */}
            <CategoryForm
                open={openForm}
                onClose={handleCloseForm}
                onSubmit={handleFormSubmit}
                defaultValues={editingCategory}
                isEditing={!!editingCategory}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete category:{" "}
                        <strong>{selectedCategory?.name}</strong>?
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
