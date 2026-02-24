import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  FormControlLabel,
  Switch,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery } from "@tanstack/react-query";
import { getProductDetails } from "./order.api";

export default function ProductDetailsDrawer({
  detailDrawerOpen,
  setDetailDrawerOpen,
  selectedProductId,
}) {
  const { data: selectedProduct, isLoading } = useQuery({
    queryKey: ["product-details", selectedProductId],
    queryFn: () => getProductDetails(selectedProductId),
    enabled: !!selectedProductId,
  });

  return (
    <Drawer
      anchor="right"
      open={detailDrawerOpen}
      onClose={() => setDetailDrawerOpen(false)}
    >
      <Box sx={{ width: 400, p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Close
          </Typography>
          <IconButton onClick={() => setDetailDrawerOpen(false)} color="error">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {isLoading && <CircularProgress />}

        {selectedProduct && (
          <Box sx={{ mt: 1 }}>
            {/* Product Name */}
            <Typography variant="caption" color="textSecondary">
              Product Name
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {selectedProduct.name}
            </Typography>

            {/* Product Type */}
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, p: 1, fontWeight: "bold" }}
            >
              {selectedProduct.product_types?.name || "No Type"}
            </Typography>

            {/* Attributes */}
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, mt: 2, fontWeight: "bold" }}
            >
              Attributes
            </Typography>

            <Paper variant="outlined" sx={{ p: 1, bgcolor: "#fafafa" }}>
              <List disablePadding>
                {selectedProduct.product_attribute_values?.length > 0 ? (
                  selectedProduct.product_attribute_values.map((attr, i) => (
                    <ListItem
                      key={i}
                      divider={
                        i !==
                        selectedProduct.product_attribute_values.length - 1
                      }
                    >
                      <ListItemText
                        primary={attr.attributes?.name}
                        secondary={attr.value}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No attributes found." />
                  </ListItem>
                )}
              </List>
            </Paper>

            {/* Active Switch */}
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(selectedProduct?.is_active)}
                  disabled
                />
              }
              label={
                Boolean(selectedProduct?.is_active) ? "Active" : "Not Active"
              }
            />

            {/* Stock */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Stock
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 1, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}
              >
                {selectedProduct.stock ?? 0}
              </Typography>
            </Box>

            {/* Description */}
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

            {/* Warehouse Details */}
            <Box sx={{ mt: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Warehouse Details
              </Typography>

              {selectedProduct?.warehouse_stock?.length > 0 ? (
                <Paper
                  variant="outlined"
                  sx={{ bgcolor: "#fafafa", borderRadius: 2, p: 2 }}
                >
                  {selectedProduct.warehouse_stock.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb:
                          index !== selectedProduct.warehouse_stock.length - 1
                            ? 2
                            : 0,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Warehouse: {item.warehouses?.name || "Unknown"}
                      </Typography>

                      <Typography variant="body2" color="primary">
                        Quantity: {item.quantity}
                      </Typography>

                      {index !== selectedProduct.warehouse_stock.length - 1 && (
                        <Divider sx={{ mt: 1 }} />
                      )}
                    </Box>
                  ))}
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
  );
}
