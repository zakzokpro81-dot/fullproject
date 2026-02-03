import * as React from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, Paper, Drawer, Divider, Stack, TextField, IconButton,
    List, ListItem, ListItemText, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CloseIcon from "@mui/icons-material/Close";

// استيراد الملفات الخاصة بك
import { getProducts, deleteProduct, getWarehouses, getProductTypes, deleteProducts } from "./product.api";
import { productColumns } from "./product.columns";
import AddProductForm from "./AddProductForm";
import EditProductForm from "./EditProductForm";

function normalizeTurkish(str = "") {
    return str
        .replace(/İ/g, "I")
        .replace(/I/g, "I")
        .replace(/ı/g, "i")
        .replace(/Ş/g, "S")
        .replace(/ş/g, "s")
        .replace(/Ğ/g, "G")
        .replace(/ğ/g, "g")
        .replace(/Ü/g, "U")
        .replace(/ü/g, "u")
        .replace(/Ö/g, "O")
        .replace(/ö/g, "o")
        .replace(/Ç/g, "C")
        .replace(/ç/g, "c")
        .toLowerCase();
}

export function ProductsList() {
    const queryClient = useQueryClient();

    // حالات التحكم
    const [openAddDialog, setOpenAddDialog] = React.useState(false);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false);
    const [selectedProduct, setSelectedProduct] = React.useState(null);
    const [searchText, setSearchText] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [selectedIds, setSelectedIds] = React.useState([]);
    const { data: warehouses = [] } = useQuery({ queryKey: ["warehouses"], queryFn: getWarehouses });
    const { data: productTypes = [] } = useQuery({ queryKey: ["productTypes"], queryFn: getProductTypes });

    const [warehouseId, setWarehouseId] = React.useState("");
    const [typeId, setTypeId] = React.useState("");

    const [paginationModel, setPaginationModel] = React.useState({
        page: 0,
        pageSize: 10,
    });

    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
        return () => clearTimeout(timer);
    }, [searchText]);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["products", paginationModel, debouncedSearch, warehouseId, typeId],
        queryFn: () => getProducts({
            page: paginationModel.page,
            pageSize: paginationModel.pageSize,
            searchText: normalizeTurkish(debouncedSearch),
            warehouseId,
            typeId
        }),
        keepPreviousData: true,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries(["products"]);
            setOpenDeleteDialog(false);
            setSelectedProduct(null);
        },
    });

    const handleEditAction = (product) => {
        setSelectedProduct(product);
        setOpenEditDialog(true);
    };

    const handleDeleteAction = (product) => {
        setSelectedProduct(product);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedProduct) {
            deleteMutation.mutate(selectedProduct.id);
        }
    };

    const handleRowClick = (params, event) => {
        if (event.target.closest('.MuiDataGrid-actionsCell') || event.target.closest('button')) {
            return;
        }
        setSelectedProduct(params.row);
        setDetailDrawerOpen(true);
    };

    const columns = productColumns(handleEditAction, handleDeleteAction);
    const handleAddClick = () => {
        setOpenAddDialog(true);
    };
    const handleDeleteSelected = async () => {
        await deleteProducts(selectedIds);
        queryClient.invalidateQueries(["products"]);
        setSelectedIds([]);
    };
    const toggleSelect = (id) => {
        const newSet = new Set(selectedIds);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setSelectedIds(newSet);
    };
    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Stack direction="row" spacing={1}>
                <Button color="error" variant="contained" disabled={selectedIds.size === 0} onClick={handleDeleteSelected}>
                    Delete Selected ({selectedIds.size})
                </Button>
                <Button variant="contained" onClick={handleAddClick}>Add Product</Button>
            </Stack>

            <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>Inventory Management</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <TextField
                        fullWidth size="small" placeholder="Search product..."
                        value={searchText} onChange={(e) => setSearchText(e.target.value)}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Warehouse</InputLabel>
                        <Select value={warehouseId} label="Warehouse" onChange={(e) => setWarehouseId(e.target.value)}>
                            <MenuItem value="">All Warehouses</MenuItem>
                            {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Type</InputLabel>
                        <Select value={typeId} label="Type" onChange={(e) => setTypeId(e.target.value)}>
                            <MenuItem value="">All Types</MenuItem>
                            {productTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            <Paper sx={{ height: 650, width: '100%' }}>
                {data?.data && (
                    <DataGrid
                        rows={data.data}
                        rowCount={data.count || 0}
                        columns={columns}

                        checkboxSelection
                        selectionModel={selectedIds}
                        onSelectionModelChange={(newSelection) => {
                            setSelectedIds(Array.isArray(newSelection) ? newSelection : []);
                        }}

                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}

                        pageSizeOptions={[10, 25, 50]}

                        disableRowSelectionOnClick
                        onRowClick={handleRowClick}
                    />
                )}

                {console.log("selected ids", selectedIds)}

                {console.log(data.data[0])}
            </Paper>

            <Drawer anchor="right" open={detailDrawerOpen} onClose={() => setDetailDrawerOpen(false)}>
                <Box sx={{ width: 400, p: 10 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Close</Typography>
                        <IconButton onClick={() => setDetailDrawerOpen(false)} color="error"><CloseIcon /></IconButton>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    {selectedProduct && (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="textSecondary">Product Name</Typography>
                            <Typography variant="h6" sx={{ mb: 1 }}>{selectedProduct.name}</Typography>
                            <Typography variant="h7" sx={{ mb: 1, p: 3, fontWeight: 'bold' }}>{selectedProduct.product_type
                                .name}</Typography>
                            <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, fontWeight: 'bold' }}>Attributes</Typography>
                            <Paper variant="outlined" sx={{ p: 1, bgcolor: '#fafafa' }}>
                                <List disablePadding>
                                    {selectedProduct.attributes?.map((attr, i) => (
                                        <ListItem key={i} divider={i !== selectedProduct.attributes.length - 1}>
                                            <ListItemText primary={attr.attribute?.name} secondary={attr.value} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>

                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Description</Typography>
                                <Typography variant="body2" sx={{ mt: 1, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                    {selectedProduct.description || "No description."}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Drawer>

            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Product</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteConfirm}>Delete</Button>
                </DialogActions>
            </Dialog>

            {openAddDialog && <AddProductForm open={openAddDialog} onClose={() => setOpenAddDialog(false)} />}
            {openEditDialog && selectedProduct && (
                <EditProductForm
                    open={openEditDialog}
                    onClose={() => { setOpenEditDialog(false); setSelectedProduct(null); }}
                    product={selectedProduct}
                />
            )}
        </Box>
    );
}