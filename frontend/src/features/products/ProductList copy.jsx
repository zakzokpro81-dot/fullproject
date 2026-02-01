import * as React from 'react';
import { 
    Box, Button, Typography, Paper, Drawer, Divider, 
    Stack, TextField, IconButton, List, ListItem, ListItemText ,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CloseIcon from "@mui/icons-material/Close";

// استيراد الملفات الخاصة بك
import { getProducts, deleteProduct } from "./product.api";
import  {productColumns}  from "./product.columns";
import AddProductForm from "./AddProductForm";
import EditProductForm from "./EditProductForm";

export function ProductsList() {
    const queryClient = useQueryClient();
    
    // حالات التحكم في النوافذ (Dialogs & Drawer)
    const [openAddDialog, setOpenAddDialog] = React.useState(false);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false);
    
    // تخزين المنتج المختار للعمليات
    const [selectedProduct, setSelectedProduct] = React.useState(null);
    const [searchText, setSearchText] = React.useState("");

    // حالات التحكم في الترقيم (Pagination)
    const [paginationModel, setPaginationModel] = React.useState({
        page: 0,
        pageSize: 10,
    });


    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    // تأخير البحث قليلاً (Debounce) لكي لا نرسل طلباً للسيرفر مع كل حرف يكتبه المستخدم
    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
        return () => clearTimeout(timer);
    }, [searchText]);


    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["products", paginationModel, debouncedSearch],
        queryFn: () => getProducts({ 
            page: paginationModel.page, 
            pageSize: paginationModel.pageSize,
            searchText: debouncedSearch 
        }),
        keepPreviousData: true, // ميزة رائعة تجعل الجدول لا يختفي أثناء تحميل الصفحة التالية
    });


    // استخدمناه في جلب كل البيانات  جلب البيانات
    // const { data: products = [], isLoading } = useQuery({
    //     queryKey: ["products"],
    //     queryFn: getProducts,
    // });

    // دالة حذف منتج واحد
    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries(["products"]);
            setSelectedProduct(null);
        },
    });

    // معالجات الأحداث التي سنمررها لملف الأعمدة (productColumns)
    const handleEditAction = (product) => {
        setSelectedProduct(product);
        setOpenEditDialog(true);
    };

    const handleDeleteAction = (product) => {
        if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
            deleteMutation.mutate(product.id);
        }
    };

    // تخصيص الضغط على الصف لفتح الـ Drawer (التفاصيل)
    const handleRowClick = (params) => {
        setSelectedProduct(params.row);
        setDetailDrawerOpen(true);
    };

    // تجهيز الأعمدة باستخدام الدالة المستوردة
    const columns = productColumns(handleEditAction, handleDeleteAction);

    // فلترة البحث
    // const filteredRows = products.filter((row) =>
    //     row.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    //     row.product_type.name?.toLowerCase().includes(searchText.toLowerCase())
    // );
    // React.useEffect(()=>{
    //     console.log("hi",products)
    // })

    if (isLoading) return <Typography sx={{ p: 4 }}>Loading Products...</Typography>;

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            
            {/* الجزء العلوي: العنوان والبحث */}
            <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Inventory Management
                </Typography>
                <Stack direction="row" spacing={2}>
                    <TextField 
                        size="small" 
                        placeholder="Search by name or part..." 
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        sx={{ width: 250 }}
                    />
                    <Button variant="contained" onClick={() => setOpenAddDialog(true)}>
                        + Add Product
                    </Button>
                </Stack>
            </Paper>

            {/* الجدول الرئيسي (DataGrid) */}
            <Paper sx={{ height: 650, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                <DataGrid
                    rows={data?.data || []}
                    rowCount={data?.count || 0} // العدد الإجمالي من السيرفر
                    loading={isLoading || isFetching}
                    columns={columns}
                    // إعدادات السيرفر
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    // بقية الإعدادات
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                    onRowClick={handleRowClick} // ميزة فتح التفاصيل عند الضغط على أي مكان في الصف
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-row:hover': { cursor: 'pointer', backgroundColor: '#f5f5f5' },
                        '& .MuiDataGrid-cell:focus': { outline: 'none' },
                    }}
                    showToolbar
                slots={{
                    toolbar: GridToolbar,
                }}
                />
            </Paper>

            {/* Drawer الجانبي: يعرض الـ Attributes والوصف */}
            <Drawer
                anchor="right"
                open={detailDrawerOpen}
                onClose={() => setDetailDrawerOpen(false)}
                PaperProps={{ sx: { width: 400 } }}
            >
                <Box sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Technical Details</Typography>
                        <IconButton onClick={() => setDetailDrawerOpen(false)}><CloseIcon /></IconButton>
                    </Stack>
                    <Divider />

                    {selectedProduct && (
                        <Box sx={{ mt: 3 }}>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="caption" color="textSecondary">Product Name</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 500 }}>{selectedProduct.name}</Typography>
                            </Box>

                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#666' }}>Attributes</Typography>
                            <Paper variant="outlined" sx={{ borderRadius: 2, bgcolor: '#fafafa' }}>
                                <List disablePadding>
                                    {selectedProduct.attributes?.length > 0 ? (
                                        selectedProduct.attributes.map((attr, index) => (
                                            <ListItem key={index} divider={index !== selectedProduct.attributes.length - 1}>
                                                <ListItemText 
                                                    primary={attr.attribute?.name || "Attribute"} 
                                                    secondary={attr.value} 
                                                    primaryTypographyProps={{ variant: 'caption', color: 'primary' }}
                                                    secondaryTypographyProps={{ variant: 'body1', sx: { fontWeight: 500 } }}
                                                />
                                            </ListItem>
                                        ))
                                    ) : (
                                        <ListItem><ListItemText primary="No technical attributes defined." /></ListItem>
                                    )}
                                </List>
                            </Paper>

                            <Box sx={{ mt: 4 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Description</Typography>
                                <Typography variant="body2" sx={{ mt: 1, p: 2, bgcolor: '#f0f4f8', borderRadius: 2 }}>
                                    {selectedProduct.description || "No description provided for this item."}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Drawer>

            {/* ملفات الفورم (التي بنيناها سابقاً) */}
            {openAddDialog && (
                <AddProductForm open={openAddDialog} onClose={() => setOpenAddDialog(false)} />
            )}

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