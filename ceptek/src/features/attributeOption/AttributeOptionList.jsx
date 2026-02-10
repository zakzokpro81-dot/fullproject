import * as React from "react";
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

import { getAttributeOptions, deleteAttributeOption ,getAttributes } from "./attributeOption.api";

import { attributeOptionColumns } from "./attributeOption.columns";
import AttributeOptionForm from "./AttributeOptionForm";

export  function AttributeOptionList() {
    const queryClient = useQueryClient();

    const [openForm, setOpenForm] = React.useState(false);
    const [editingRow, setEditingRow] = React.useState(null);

    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState(null);

    // جلب Attribute Options
    const { data: attributeOptions = [], isLoading } = useQuery({
        queryKey: ["attribute-options"],
        queryFn: getAttributeOptions,
    });

    // جلب Attributes (للاستخدام في الفورم لاحقًا)
    const { data: attributes = [] } = useQuery({
        queryKey: ["attributes"],
        queryFn: getAttributes,
    });

    // حذف
    const deleteMutation = useMutation({
        mutationFn: deleteAttributeOption,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attribute-options"] });
            handleCloseDeleteDialog();
        },
    });

    const handleOpenAdd = () => {
        setEditingRow(null);
        setOpenForm(true);
    };

    const handleOpenEdit = (row) => {
        setEditingRow(row);
        setOpenForm(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
        setEditingRow(null);
    };

    const handleOpenDeleteDialog = (row) => {
        setSelectedRow(row);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setSelectedRow(null);
    };

    const handleConfirmDelete = () => {
        if (!selectedRow) return;
        deleteMutation.mutate(selectedRow.id);
    };

    const columns = attributeOptionColumns(handleOpenEdit, handleOpenDeleteDialog);

    return (
        <Box sx={{ width: "100%" }}>
            <Stack direction="row" justifyContent="space-between" mb={2}>
                <Typography variant="h5">Attribute Options</Typography>
                <Button variant="contained" onClick={handleOpenAdd}>
                    Add Attribute Option
                </Button>
            </Stack>

            <DataGrid
                rows={attributeOptions}
                columns={columns}
                loading={isLoading}
                autoHeight
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: { quickFilterAlwaysVisible: true },
                }}
                sx={{ width: "100%" }}
                getRowId={(row) => row.id}
            />

            {/* Form Dialog */}
            <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="sm">
                <DialogTitle>
                    {editingRow ? "Edit Attribute Option" : "Add Attribute Option"}
                </DialogTitle>
                <DialogContent>
                    <AttributeOptionForm
                        defaultValues={editingRow}
                        attributes={attributes}
                        onClose={handleCloseForm}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete:
                        <strong> {selectedRow?.value}</strong> ?
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
