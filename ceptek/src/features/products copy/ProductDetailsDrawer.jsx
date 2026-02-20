import * as React from "react";
import { Drawer, Box, Stack, Typography, IconButton, Divider, Paper, List, ListItem, ListItemText, FormControlLabel, Switch } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export function ProductDetailsDrawer({ detailDrawerOpen, setDetailDrawerOpen, selectedProduct }) {
   
    return (

        <Drawer
            anchor="right"
            open={detailDrawerOpen}
            onClose={() => setDetailDrawerOpen(false)}
        >
            <Box sx={{ width: 400, p: 10 }}>
                <Stack
                    direction="row"
                    justifyContent="right"
                    alignItems="center"
                    mb={2}
                >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Close
                    </Typography>
                    <IconButton
                        onClick={() => setDetailDrawerOpen(false)}
                        color="error"
                    >
                        <CloseIcon />
                    </IconButton>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                {selectedProduct && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                            Product Name
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            {selectedProduct.name}
                        </Typography>
                        <Typography variant="h7" sx={{ mb: 1, p: 3, fontWeight: "bold" }}>
                            {selectedProduct.product_type.name}
                        </Typography>
                        <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, mt: 2, fontWeight: "bold" }}
                        >
                            Attributes
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 1, bgcolor: "#fafafa" }}>
                            <List disablePadding>
                                {selectedProduct.attributes?.map((attr, i) => (
                                    <ListItem
                                        key={i}
                                        divider={i !== selectedProduct.attributes.length - 1}
                                    >
                                        <ListItemText
                                            primary={attr.attribute?.name}
                                            secondary={attr.value}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>

                        <FormControlLabel
                            control={
                                <Switch
                                    defaultChecked={Boolean(selectedProduct?.is_active)}
                                    disabled
                                />
                            }
                            label={
                                Boolean(selectedProduct?.is_active) === true
                                    ? "Active"
                                    : "Not Active"
                            }
                        />
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                stock
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ mt: 1, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}
                            >
                                {selectedProduct.stock || "No stock."}
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                Description
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ mt: 1, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}
                            >
                                {selectedProduct.description || "No description."}
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 3 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: "bold", mb: 1 }}
                            >
                                Warehouse details
                            </Typography>

                            {selectedProduct?.warehouse_stock ? (
                                <Paper
                                    variant="outlined"
                                    sx={{ bgcolor: "#fafafa", borderRadius: 2, p: 2 }}
                                >
                                    {/* إذا كانت البيانات مصفوفة نعرضها بـ map، وإذا كانت كائناً نعرضها مباشرة */}
                                    {Array.isArray(selectedProduct.warehouse_stock) ? (
                                        selectedProduct.warehouse_stock.map((item, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    mb:
                                                        index !==
                                                            selectedProduct.warehouse_stock.length - 1
                                                            ? 2
                                                            : 0,
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: "bold" }}
                                                >
                                                    warehouse:{" "}
                                                    {item.warehouse?.name || item.warehouse_id}
                                                </Typography>
                                                <Typography variant="body2" color="primary">
                                                    Quantity: {item.quantity}
                                                </Typography>
                                                {index !==
                                                    selectedProduct.warehouse_stock.length - 1 && (
                                                        <Divider sx={{ mt: 1 }} />
                                                    )}
                                            </Box>
                                        ))
                                    ) : (
                                        // في حال وصولها ككائن واحد (وهو سبب الخطأ لديك حالياً)
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                                Warehouse Inventory:{" "}
                                                {selectedProduct.warehouse_stock.warehouse?.name ||
                                                    selectedProduct.warehouse_stock.warehouse_id}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="primary"
                                                sx={{ fontWeight: "bold" }}
                                            >
                                                Available Quantity:{" "}
                                                {selectedProduct.warehouse_stock.quantity}
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            ) : (
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ p: 2, bgcolor: "#eee", borderRadius: 2 }}
                                >
                                    No stock records found for this product.
                                </Typography>
                            )}
                        </Box>
                    </Box>
                )}
            </Box>
        </Drawer>
    )
}
