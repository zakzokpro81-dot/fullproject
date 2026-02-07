import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from './warehouse.api';
import { warehouseColumns } from './warehouse.columns';
import { WarehouseForm } from './WarehouseForm';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';

export function WarehousesList() {
    const queryClient = useQueryClient();

    // ✅ useQuery بالشكل الصحيح v5
    const { data: warehouses = [], isLoading } = useQuery({
        queryKey: ['warehouses'],
        queryFn: getWarehouses,
        
    });


    // ✅ useMutation بالشكل الصحيح v5
    const createMutation = useMutation({
        mutationFn: createWarehouse,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateWarehouse(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteWarehouse,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
    });

    const [openForm, setOpenForm] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [openDelete, setOpenDelete] = useState(false);

    const handleEdit = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setOpenForm(true);
    };

    const handleDelete = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setOpenDelete(true);
    };

    const handleFormSubmit = (data) => {
        if (selectedWarehouse) {
            updateMutation.mutate({ id: selectedWarehouse.id, data });
        } else {
            console.log('Data to create warehouse:', data);

            createMutation.mutate(data);

        }
        setOpenForm(false);
        setSelectedWarehouse(null);
    };

    const confirmDelete = () => {
        deleteMutation.mutate(selectedWarehouse.id);
        setOpenDelete(false);
        setSelectedWarehouse(null);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpenForm(true)}>
                Add Warehouse
            </Button>

            <DataGrid
                rows={warehouses}
                columns={warehouseColumns(handleEdit, handleDelete)}
                loading={isLoading}
                autoHeight
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                components={{ Toolbar: GridToolbar }}
            />

            {/* Dialog Add/Edit */}
            <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
                <DialogTitle>{selectedWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}</DialogTitle>
                <DialogContent>
                    <WarehouseForm
                        defaultValues={selectedWarehouse || {}}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setOpenForm(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Dialog Delete */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle>Delete Warehouse</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete <b>{selectedWarehouse?.name}</b>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
                    <Button color="error" onClick={confirmDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
