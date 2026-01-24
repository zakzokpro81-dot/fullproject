import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { productColumns } from './product.columns';
import { ProductForm } from './ProductForm';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from './product.api';

export function ProductsList() {
    const { data: products = [], refetch } = useQuery({ queryKey: ['products'], queryFn: getProducts });

    const [openForm, setOpenForm] = React.useState(false);
    const [selectedProduct, setSelectedProduct] = React.useState(null);

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setOpenForm(true);
    };

    const handleDelete = (product) => {
        console.log('Delete product:', product.id);
        // link with deleteMutation later
    };

    const handleCloseForm = () => {
        setOpenForm(false);
        setSelectedProduct(null);
    };

    const handleSubmitForm = () => {
        handleCloseForm();
        refetch(); // refresh product list
    };

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <Button variant="contained" onClick={() => setOpenForm(true)} sx={{ mb: 2 }}>
                Add Product
            </Button>

            <DataGrid
                rows={products}
                columns={productColumns(handleEdit, handleDelete)}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                components={{ Toolbar: GridToolbar }}
                sx={{ width: '100%' }}
                getRowId={(row) => row.id}
            />

            <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
                <DialogContent>
                    <ProductForm defaultValues={selectedProduct || {}} onSuccess={handleSubmitForm} />
                </DialogContent>
            </Dialog>
        </Box>
    );
}
