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
    getAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
} from "./attributes.api";

import { attributeColumns } from "./attributes.columns";
import AttributeForm from "./AttributeForm";

export  function AttributeList() {
    const queryClient = useQueryClient();

    const [openForm, setOpenForm] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // Fetch
    const { data: attributes = [], isLoading } = useQuery({
        queryKey: ["attributes"],
        queryFn: getAttributes,
    });

    // Create
    const createMutation = useMutation({
        mutationFn: createAttribute,
        onSuccess: () => {
            queryClient.invalidateQueries(["attributes"]);
            handleCloseForm();
        },
    });

    // Update
    const updateMutation = useMutation({
        mutationFn: updateAttribute,
        onSuccess: () => {
            queryClient.invalidateQueries(["attributes"]);
            handleCloseForm();
        },
    });

    // Delete
    const deleteMutation = useMutation({
        mutationFn: deleteAttribute,
        onSuccess: () => {
            queryClient.invalidateQueries(["attributes"]);
            handleCloseDeleteDialog();
        },
    });

    const handleOpenForm = () => {
        setEditingAttribute(null);
        setOpenForm(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
        setEditingAttribute(null);
    };

    const handleEdit = (row) => {
        setEditingAttribute(row);
        setOpenForm(true);
    };

    const handleDelete = (id) => {
        setSelectedId(id);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedId(null);
    };

    const handleSubmit = (data) => {
        if (editingAttribute) {
            updateMutation.mutate({
                id: editingAttribute.id,
                payload: data,
            });
        } else {
            createMutation.mutate(data);
        }
    };

    const columns = attributeColumns(handleEdit, handleDelete);

    return (
        <Box sx={{ height: 600, width: "100%" }}>
            <Stack direction="row" justifyContent="space-between" mb={2}>
                <Typography variant="h5">Attributes</Typography>
                <Button variant="contained" onClick={handleOpenForm}>
                    Add Attribute
                </Button>
            </Stack>

            <DataGrid
                rows={attributes}
                columns={columns}
                loading={isLoading}
                getRowId={(row) => row.id}
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { quickFilterAlwaysVisible: true } }}
                sx={{ width: "100%" }}
            />

            {/* Form Dialog */}
            <AttributeForm
                open={openForm}
                onClose={handleCloseForm}
                onSubmit={handleSubmit}
                defaultValues={editingAttribute}
                isEditing={!!editingAttribute}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this attribute?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => deleteMutation.mutate(selectedId)}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
