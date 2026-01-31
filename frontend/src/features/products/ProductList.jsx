import * as React from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, IconButton, Checkbox, Stack, TextField } from "@mui/material";
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductForm from "./ProductForm";
import { getProducts, deleteProducts, deleteProduct, createProductWithStock, updateProduct, } from "./product.api";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// دالة لتحويل الحروف التركية للإنجليزية لتسهيل البحث
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
    const [selectedIds, setSelectedIds] = React.useState(new Set());
    const [expandedRows, setExpandedRows] = React.useState(new Set());
    const [openFormDialog, setOpenFormDialog] = React.useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [selectedProduct, setSelectedProduct] = React.useState(null);

    const [searchText, setSearchText] = React.useState("");
    const [sortConfig, setSortConfig] = React.useState({ key: null, direction: "asc" });

    const { data: products = [], isLoading } = useQuery({
        queryKey: ["products"],
        queryFn: getProducts,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createProductWithStock,
        onSuccess: (newProduct) => {
            queryClient.setQueryData(["products"], (oldData = []) => [newProduct, ...oldData]);
            setOpenFormDialog(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateProduct(id, data),
        onSuccess: (updatedProduct) => {
            queryClient.setQueryData(["products"], (oldData = []) =>
                oldData.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
            );
            setOpenFormDialog(false);
            setSelectedProduct(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries(["products"]);
            setOpenDeleteDialog(false);
            setSelectedProduct(null);
        },
    });

    const handleAddClick = () => { setSelectedProduct(null); setOpenFormDialog(true); };
    const handleEditClick = (product) => { setSelectedProduct(product); setOpenFormDialog(true); };
    const handleDeleteClick = (product) => { setSelectedProduct(product); setOpenDeleteDialog(true); };
    const handleDeleteConfirm = () => { deleteMutation.mutate(selectedProduct.id); };
    const handleFormSubmit = (data) => { selectedProduct ? updateMutation.mutate({ id: selectedProduct.id, data }) : createMutation.mutate(data); };

    const toggleExpand = (id) => {
        const newSet = new Set(expandedRows);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setExpandedRows(newSet);
    };
    const toggleSelect = (id) => {
        const newSet = new Set(selectedIds);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setSelectedIds(newSet);
    };
    const handleDeleteSelected = async () => { await deleteProducts(Array.from(selectedIds)); queryClient.invalidateQueries(["products"]); setSelectedIds(new Set()); };

    // معالجة البحث مع الحروف التركية
    const filteredProducts = products.filter(p =>
        normalizeTurkish(p.name).includes(normalizeTurkish(searchText)) ||
        normalizeTurkish(p.product_type?.name).includes(normalizeTurkish(searchText))
    );

   // معالجة الفرز
const sortedProducts = React.useMemo(() => {
    if (!sortConfig.key) return filteredProducts;
    return [...filteredProducts].sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // إذا كان الحقل كائن مثل product_type نأخذ الاسم
        if (sortConfig.key === "product_type") {
            valA = valA?.name ?? "";
            valB = valB?.name ?? "";
        }

        // تحويل الحروف التركية إلى إنجليزية لتفادي مشاكل الفرز
        valA = normalizeTurkish(String(valA));
        valB = normalizeTurkish(String(valB));

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });
}, [filteredProducts, sortConfig]);


    const handleSort = (key) => {
        if (sortConfig.key === key) {
            setSortConfig({ key, direction: sortConfig.direction === "asc" ? "desc" : "asc" });
        } else {
            setSortConfig({ key, direction: "asc" });
        }
    };

    if (isLoading) return <Typography>Loading...</Typography>;

    return (
        <Box>
            {/* Toolbar */}
            <Box display="flex" justifyContent="space-between" mb={2} alignItems="center" p={1}>
                <Typography variant="h5">Products</Typography>
                 <TextField label="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)} size="small" />
                <Stack direction="row" spacing={1}>
                   
                    <Button color="error" variant="contained" disabled={selectedIds.size === 0} onClick={handleDeleteSelected}>
                        Delete Selected ({selectedIds.size})
                    </Button>
                    <Button variant="contained" onClick={handleAddClick}>Add Product</Button>
                </Stack>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox checked={selectedIds.size > 0 && selectedIds.size === sortedProducts.length} indeterminate={selectedIds.size > 0 && selectedIds.size < sortedProducts.length} onChange={(e) => e.target.checked ? setSelectedIds(new Set(sortedProducts.map(p => p.id))) : setSelectedIds(new Set())} />
                            </TableCell>
                            {[
                                { key: "name", label: "Name" },
                                { key: "product_type", label: "Product Type", isObject: true, objKey: "name" },
                                { key: "sell_price", label: "Sell Price" },
                                { key: "cost_price", label: "Cost Price" },
                                { key: "stock", label: "Stock" }
                            ].map((col) => (
                                <TableCell key={col.key} onClick={() => handleSort(col.key)} style={{ cursor: "pointer", userSelect: "none" }}>
                                    {col.label}{" "}
                                    {sortConfig.key === col.key ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                                </TableCell>
                            ))}
                            <TableCell>Actions</TableCell>
                            <TableCell>Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedProducts.map((row) => (
                            <React.Fragment key={row.id}>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox checked={selectedIds.has(row.id)} onChange={() => toggleSelect(row.id)} />
                                    </TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.product_type?.name}</TableCell>
                                    <TableCell>{row.sell_price}</TableCell>
                                    <TableCell>{row.cost_price}</TableCell>
                                    <TableCell>{row.stock}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEditClick(row)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteClick(row)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => toggleExpand(row.id)}>
                                            {expandedRows.has(row.id) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={11} style={{ paddingBottom: 0, paddingTop: 0 }}>
                                        <Collapse in={expandedRows.has(row.id)} timeout="auto" unmountOnExit>
                                            <Box margin={2}>
                                                <Typography variant="subtitle1" gutterBottom>Attributes:</Typography>
                                                <Box display="grid" gridTemplateColumns="repeat(auto-fit,minmax(150px,1fr))" gap={1}>
                                                    {row.attributes?.length === 0 ? <Typography>No attributes</Typography> : row.attributes.map((attr, idx) => (
                                                        <Paper key={idx} sx={{ p: 1, bgcolor: "#f9f9f9" }}>
                                                            <Typography variant="body2"><strong>{attr.attribute?.name}:</strong> {attr.value}</Typography>
                                                        </Paper>
                                                    ))}
                                                </Box>
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <ProductForm open={openFormDialog} onClose={() => setOpenFormDialog(false)} defaultValues={selectedProduct} onSubmit={handleFormSubmit} />
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Confirm</DialogTitle>
                <DialogContent>Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteConfirm}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
