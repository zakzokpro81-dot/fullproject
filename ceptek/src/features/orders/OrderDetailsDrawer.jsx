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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ProductDetailsDrawer from "./ProductDetailsDrawer";

export default function OrderDetailsDrawer({
  order,
  onClose,
  confirmMutation,
}) {
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });

  const handleCloseError = () => setErrorDialog({ open: false, message: "" });

  const handleConfirmShip = () => {
    confirmMutation?.mutate(
      {
        orderId: order.id,
        warehouseId: order.warehouse_id,
        items: order.raw_items,
      },
      {
        onSuccess: () => {
          setConfirmDialogOpen(false);
          onClose();
        },
        onError: (err) => {
          setConfirmDialogOpen(false);
          setErrorDialog({ open: true, message: err.message });
        },
      },
    );
  };

  if (!order) return null;

  return (
    <Drawer
      anchor="right"
      open={!!order}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 450 }, bgcolor: "#fcfcfc" },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight="bold" color="primary">
            Order Details #{order.id}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          {/* Customer */}
          <Stack direction="row" spacing={2} alignItems="center">
            <PersonIcon color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Customer
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {order.customer_name}
              </Typography>
            </Box>
          </Stack>

          {/* Warehouse */}
          <Stack direction="row" spacing={2} alignItems="center">
            <StorefrontIcon color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Dispatching Warehouse
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {order.warehouse_name}
              </Typography>
            </Box>
          </Stack>

          {/* Date */}
          <Stack direction="row" spacing={2} alignItems="center">
            <CalendarTodayIcon color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Order Date
              </Typography>
              <Typography variant="body1">{order.order_date}</Typography>
            </Box>
          </Stack>

          {/* Status */}
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Status
            </Typography>
            <Chip
              label={order.status_display}
              color={order.status_display === "Pending" ? "warning" : "success"}
              size="small"
              sx={{ fontWeight: "bold" }}
            />
          </Box>

          <Divider />

          {/* Items Table */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
              Ordered Items
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "grey.100" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Qty
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.raw_items?.map((item, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedProductId(item.products?.id);
                        setDetailDrawerOpen(true);
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {item.products?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SKU: {item.products?.sku || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>

          <ProductDetailsDrawer
            detailDrawerOpen={detailDrawerOpen}
            setDetailDrawerOpen={setDetailDrawerOpen}
            selectedProductId={selectedProductId}
          />

          {/* Notes */}
          {order.notes && (
            <Box
              sx={{
                p: 2,
                bgcolor: "warning.50",
                border: 1,
                borderColor: "warning.light",
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" fontWeight="bold" color="warning.dark" display="block" gutterBottom>
                Internal Notes:
              </Typography>
              <Typography variant="body2" color="warning.dark">
                {order.notes}
              </Typography>
            </Box>
          )}

          {/* Confirm & Ship Button */}
          {(String(order.status_id) === "1" || order.status_display === "Pending") && (
            <Box sx={{ mt: 4, width: "100%" }}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                startIcon={<LocalShippingIcon />}
                onClick={() => setConfirmDialogOpen(true)}
                disabled={confirmMutation?.isPending}
                sx={{ py: 1.5, fontWeight: "bold" }}
              >
                {confirmMutation?.isPending ? "Processing..." : "Confirm & Ship Order"}
              </Button>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Shipping</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to confirm and ship this order? This action
            will deduct the items from the warehouse stock and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmShip}
            color="success"
            variant="contained"
            disabled={confirmMutation?.isPending}
          >
            Confirm & Ship
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Alert Dialog */}
      <Dialog open={errorDialog.open} onClose={handleCloseError}>
        <DialogTitle sx={{ color: "error.main", display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon color="error" />
          Stock Alert
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1">{errorDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseError} variant="contained" color="primary" fullWidth>
            Understood
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}
