//الصفحة الرئيسية للـ Families، تعرض DataGrid، Toolbar، وDialog حذف.



// src/features/families/FamilyList.jsx

import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import FamilyForm from "./FamilyForm";
import { familyColumns } from "./family.columns";
import { getFamilies, createFamily, updateFamily, deleteFamily } from "./family.api";

export  function FamilyList() {
    const queryClient = useQueryClient();

    const [selectedFamily, setSelectedFamily] = useState(null);
    const [openForm, setOpenForm] = useState(false);
    const [mode, setMode] = useState("add");

    const [openDelete, setOpenDelete] = useState(false);

    // Fetch families
    const { data: families = [], isLoading } = useQuery({
        queryKey: ["families"],
        queryFn: getFamilies,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createFamily,
        onSuccess: () => {
            queryClient.invalidateQueries(["families"]);
            handleCloseForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateFamily(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["families"]);
            handleCloseForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteFamily,
        onSuccess: () => {
            queryClient.invalidateQueries(["families"]);
            setOpenDelete(false);
            setSelectedFamily(null);
        },
    });

    // Handlers
    const handleOpenAdd = () => {
        setMode("add");
        setSelectedFamily(null);
        setOpenForm(true);
    };

    const handleOpenEdit = (family) => {
        setMode("edit");
        setSelectedFamily(family);
        setOpenForm(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
        setSelectedFamily(null);
    };

    const handleSubmit = (data) => {
        if (mode === "add") {
            createMutation.mutate(data);
        } else {
            updateMutation.mutate({ id: selectedFamily.id, data });
        }
    };

    const handleDeleteClick = (family) => {
        setSelectedFamily(family);
        setOpenDelete(true);
    };

    const confirmDelete = () => {
        if (!selectedFamily) return;
        deleteMutation.mutate(selectedFamily.id);
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Families</Typography>
                <Button variant="contained" onClick={handleOpenAdd}>
                    Add Family
                </Button>
            </Box>

            <Box sx={{ width: "100%", overflowX: "auto" }}>
                <DataGrid
                    rows={families|| []}
                    columns={familyColumns(handleOpenEdit, handleDeleteClick)}
                    autoHeight
                    loading={isLoading}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: { paginationModel: { page: 0, pageSize: 25 } },
                    }}
                    slots={{
                        toolbar: GridToolbar,
                    }}
                />
            </Box>

            <FamilyForm
                open={openForm}
                mode={mode}
                initialData={selectedFamily}
                onClose={handleCloseForm}
                onSubmit={handleSubmit}
            />

            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete family{" "}
                    <strong>{selectedFamily?.name}</strong>? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
                    <Button variant="contained" onClick={confirmDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
