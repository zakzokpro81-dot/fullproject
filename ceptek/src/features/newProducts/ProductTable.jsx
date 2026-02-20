import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Paper,
} from "@mui/material";
import React from "react";
export function ProductTable({ products, onProductClick }) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f8f9fa" }}>
          <TableRow>
            <TableCell>Product Info</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Inventory (By Warehouse)</TableCell>
            <TableCell>Total Stock</TableCell>
            <TableCell>Price</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              hover
              onClick={() => onProductClick(product)}
              style={{ cursor: "pointer" }}
            >
              <TableCell>
                <Typography variant="subtitle2">{product.name}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {product.sku}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={product.product_type?.name}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                {product.warehouse_stock?.map((ws) => (
                  <Box key={ws.warehouse.id} sx={{ mb: 0.5 }}>
                    <Typography variant="caption" display="block">
                      {ws.warehouse.name}: <strong>{ws.quantity}</strong>
                    </Typography>
                  </Box>
                ))}
              </TableCell>
              <TableCell>
                <Typography
                  fontWeight="bold"
                  color={product.stock > 10 ? "success.main" : "error.main"}
                >
                  {product.stock}
                </Typography>
              </TableCell>
              <TableCell>${product.sell_price}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
