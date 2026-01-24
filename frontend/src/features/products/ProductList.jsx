// src/features/products/ProductsList.jsx
import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { productColumns } from './product.columns';
import { ProductForm } from './ProductForm';

export function ProductsList() {
    const [products, setProducts] = React.useState([]);
    const [openForm, setOpenForm] = React.useState(false);
    const [selectedProduct, setSelectedProduct] = React.useState(null);

    // عند الضغط على تعديل
    const handleEdit = (product) => {
        setSelectedProduct(product);
        setOpenForm(true);
    };

    // عند الضغط على حذف
    const handleDelete = (product) => {
        console.log('Delete product:', product.id);
        // الربط مع deleteMutation لاحقًا
    };

    // غلق الفورم
    const handleCloseForm = () => {
        setOpenForm(false);
        setSelectedProduct(null);
    };

    // عند حفظ الفورم
    const handleSubmitForm = (data) => {
        console.log('Form submitted:', data);
        handleCloseForm();
        // الربط مع create/update Mutation لاحقًا
    };

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <Button variant="contained" onClick={() => setOpenForm(true)} sx={{ mb: 2 }}>
                إضافة منتج
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
                <DialogTitle>
                    {selectedProduct ? 'تعديل المنتج' : 'إضافة منتج'}
                </DialogTitle>
                <DialogContent>
                    <ProductForm defaultValues={selectedProduct || {}} onSubmit={handleSubmitForm} />
                </DialogContent>
            </Dialog>
        </Box>
    );
}
