import { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useQuery } from "@tanstack/react-query";
import { getInvoiceDetails } from "./invoice.api";
import ProductDetailsDrawer from "../orders/ProductDetailsDrawer";

export default function InvoiceDetailsDrawer({ invoice, onClose }) {
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ["invoice-details", invoice?.id],
    queryFn: () => getInvoiceDetails(invoice.id),
    enabled: !!invoice?.id,
  });

  if (!invoice) return null;

  return (
    <Drawer
      anchor="right"
      open={!!invoice}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 500 } } }}
    >
      <Box sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" fontWeight="bold">
            Invoice #{invoice.id}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Info Section */}
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon color="action" />
            <Typography variant="body1">{invoice.customer_name}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarTodayIcon color="action" />
            <Typography variant="body2">{invoice.invoice_date}</Typography>
          </Stack>
          <Chip
            label={invoice.status_name}
            color={invoice.status_name === "Paid" ? "success" : "warning"}
            sx={{ width: "fit-content" }}
            size="small"
          />
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fafafa", mb: 3 }}>
          <Typography fontWeight="bold" gutterBottom>
            Payment Summary
          </Typography>
          <Stack spacing={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Total:</Typography>
              <Typography variant="body2" fontWeight="bold">
                ${invoice.total_amount}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Paid:</Typography>
              <Typography variant="body2" color="success.main">
                ${invoice.paid_amount || 0}
              </Typography>
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Balance:</Typography>
              <Typography variant="body2" color="error.main" fontWeight="bold">
                $
                {(invoice.total_amount - (invoice.paid_amount || 0)).toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Typography fontWeight="bold" sx={{ mb: 1 }}>
          Items
        </Typography>

        {isLoading ? (
          <Typography variant="caption">Loading items...</Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items?.map((item, index) => (
                  <TableRow
                    key={item.id || index}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedProductId(item.product?.id);
                      setDetailDrawerOpen(true);
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.product?.name || "Unknown Product"}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                      >
                        SKU: {item.product?.sku || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="center">
                      {Number(item.unit_price).toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {Number(item.total).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <ProductDetailsDrawer
        detailDrawerOpen={detailDrawerOpen}
        setDetailDrawerOpen={setDetailDrawerOpen}
        selectedProductId={selectedProductId}
      />
    </Drawer>
  );
}

const TableContainer = ({ children, component, ...props }) => {
  const Component = component || Box;
  return <Component {...props}>{children}</Component>;
};
