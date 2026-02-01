import * as React from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, Paper, Drawer, Divider, Stack, TextField, IconButton,
    List, ListItem, ListItemText
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CloseIcon from "@mui/icons-material/Close";

// استيراد الملفات الخاصة بك
import { getProducts, deleteProduct } from "./product.api";
import { productColumns } from "./product.columns";
import AddProductForm from "./AddProductForm";
import EditProductForm from "./EditProductForm";

// --- إعادة الدالة التي تم حذفها خطأً ---
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
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false); // إعادة الحالة
    const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false);

    const [selectedProduct, setSelectedProduct] = React.useState(null);
    const [searchText, setSearchText] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");

    // الترقيم (Pagination)
    const [paginationModel, setPaginationModel] = React.useState({
        page: 0,
        pageSize: 10,
    });

    // البحث المتأخر
    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
        return () => clearTimeout(timer);
    }, [searchText]);

    // جلب البيانات
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["products", paginationModel, debouncedSearch],
        queryFn: () => getProducts({
            page: paginationModel.page,
            pageSize: paginationModel.pageSize,
            searchText: normalizeTurkish(debouncedSearch) // استخدام دالة التحويل هنا
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

    // --- معالجات الأحداث المعدلة لمنع التداخل ---
    const handleEditAction = (product) => {
        setSelectedProduct(product);
        setOpenEditDialog(true);
    };

    const handleDeleteAction = (product) => {
        setSelectedProduct(product);
        setOpenDeleteDialog(true); // فتح الدايلوج بدلاً من confirm المتصفح
    };

    const handleDeleteConfirm = () => {
        if (selectedProduct) deleteMutation.mutate(selectedProduct.id);
    };

    const handleRowClick = (params, event) => {
        // منع فتح الدراور إذا كان الضغط على منطقة الأزرار
        if (event.target.closest('.MuiDataGrid-actionsCell') || event.target.closest('button')) {
            return;
        }
        setSelectedProduct(params.row);
        setDetailDrawerOpen(true);
    };

    const columns = productColumns(handleEditAction, handleDeleteAction);

    return (
        <Box sx={{ width: '100%', p: 3 }}>

            <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Products</Typography>
                <Stack direction="row" spacing={2}>
                    <TextField
                        size="small"
                        placeholder="Search..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Button variant="contained" onClick={() => setOpenAddDialog(true)}>Add Product</Button>
                </Stack>
            </Paper>

            <Paper sx={{ height: 650, width: '100%' }}>
                <DataGrid
                    rows={data?.data || []}
                    rowCount={data?.count || 0}
                    loading={isLoading || isFetching}
                    columns={columns}
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    disableSelectionOnClick
                    onRowClick={handleRowClick}
                    sx={{
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 'bold',
                            fontSize: { xs: '0.8rem', sm: '1rem' } // تصغير الخط للموبايل
                        },
                        '& .MuiDataGrid-cell': {
                            fontSize: { xs: '0.75rem', sm: '0.9rem' }
                        },
                        // منع التمرير الأفقي المزعج وجعل الجدول يمتد
                        width: '100%',
                    }}

                    sx={{
                        '& .MuiDataGrid-row:hover': { cursor: 'pointer' },
                    }}
                    columnVisibilityModel={{
                        description: false, // إخفاء الوصف في الموبايل
                        cost_price: false,  // إخفاء سعر التكلفة في الموبايل لزيادة المساحة
                    }}

                />
            </Paper>

            {/* الدراور الجانبي للتفاصيل */}
            <Drawer
                anchor="right"
                open={detailDrawerOpen}
                onClose={() => setDetailDrawerOpen(false)}
                // التعديل 1: العرض يصبح مرناً (100% للموبايل و 400px للشاشات الأكبر)
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 400 },
                        // إضافة حواف ناعمة في الشاشات الكبيرة فقط
                        borderRadius: { xs: 0, sm: '16px 0 0 16px' }
                    }
                }}
            >
                <Box sx={{ p: 3 }}>

                    <Divider />

                    {selectedProduct && (
                        <Box sx={{ mt: 6 }}>
                            <Box sx={{ mb: 4 }}>


                                <Stack
                                    direction="row"
                                    justifyContent="right"
                                    alignItems="center"
                                    mb={2}
                                    sx={{
                                        position: 'sticky', // يجعله ثابتاً في الأعلى حتى لو نزلت للأسفل في الوصف
                                        top: 0,
                                        bgcolor: 'white',
                                        zIndex: 1,
                                        pb: 1
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Close</Typography>

                                    {/* هذا هو زر الإغلاق - قمت بإضافة خلفية ملونة له ليظهر بوضوح */}
                                    <IconButton
                                        onClick={() => setDetailDrawerOpen(false)}
                                        aria-label="close"
                                        sx={{
                                           // color: (theme) => theme.palette.grey[500],
                                            backgroundColor: '#f5f5f5', // لون خلفية رمادي فاتح لتمييزه
                                            '&:hover': {
                                                backgroundColor: '#e0e0e0',
                                            },
                                            
                                        }}
                                        color="error"
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Stack>

                                <Typography variant="caption" color="textSecondary">Product Name</Typography>
                                {/* التعديل 3: تصغير حجم الخط قليلاً على الموبايل لكي لا ينكسر السطر */}
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 500,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                    }}
                                >
                                    {selectedProduct.name}
                                </Typography>
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
                                                    secondaryTypographyProps={{
                                                        variant: 'body1',
                                                        sx: { fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }
                                                    }}
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
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 1,
                                        p: 2,
                                        bgcolor: '#f0f4f8',
                                        borderRadius: 2,
                                        // التعديل 4: التأكد من أن النص الطويل لا يخرج عن الإطار في الموبايل
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {selectedProduct.description || "No description provided for this item."}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Drawer>

            {/* --- إعادة دايلوج التأكيد الذي حُذف --- */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Confirm</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteConfirm}>Delete</Button>
                </DialogActions>
            </Dialog>

            {/* نوافذ الإضافة والتعديل */}
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