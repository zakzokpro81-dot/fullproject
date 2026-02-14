import * as React from "react";
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
import ProductDetailsDrawer from "./ProductDetailsDrawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { confirmAndShipOrder } from "./order.api";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
export default function OrderDetailsDrawer({ order, onClose }) {
  const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false);
  const [selectedProductId, setSelectedProductId] = React.useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const [errorDialog, setErrorDialog] = React.useState({
    open: false,
    message: "",
  });

  const confirmMutation = useMutation({
    mutationFn: () =>
      confirmAndShipOrder(order.id, order.warehouse_id, order.raw_items),
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      onClose();
      // يمكنك إضافة Snackbar نجاح هنا بدلاً من alert المتصفح
    },
    onError: (error) => {
      // هذا هو الربط الصحيح: عندما تفشل الدالة في التحقق من الكمية
      // سيتم التقاط الخطأ هنا وتمريره للديالوغ
      setErrorDialog({
        open: true,
        message:
          error.message || "An unexpected error occurred during shipping.",
      });
    },
  });
  const handleCloseError = () => setErrorDialog({ open: false, message: "" });

  const handleShipOrder = async (orderId, warehouseId, items) => {
    try {
      // استدعاء الدالة التي قمنا بتعديلها سابقاً
      await confirmAndShipOrder(orderId, warehouseId, items);

      // في حال النجاح (يمكنك إضافة Snackbar للنجاح هنا)
      alert("Order shipped successfully!");
    } catch (error) {
      // في حال حدوث خطأ (الكمية غير كافية)
      setErrorDialog({
        open: true,
        message: error.message, // سيأتي النص من الـ throw new Error في الدالة
      });
    }
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
      <Box sx={{ p: 10 }}>
        {/* Header with Close Button */}
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

        {/* Vertical Info Stack */}
        <Stack spacing={3}>
          {/* Customer Info */}
          <Stack direction="row" spacing={2} alignItems="center">
            <PersonIcon color="action" />
            <Box>
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
              >
                Customer
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {order.customer_name}
              </Typography>
            </Box>
          </Stack>

          {/* Warehouse Info */}
          <Stack direction="row" spacing={2} alignItems="center">
            <StorefrontIcon color="action" />
            <Box>
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
              >
                Dispatching Warehouse
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {order.warehouse_name}{" "}
                {/* سيعمل الآن بعد تعديل الـ API أعلاه */}
              </Typography>
            </Box>
          </Stack>
          {/* Date Info */}
          <Stack direction="row" spacing={2} alignItems="center">
            <CalendarTodayIcon color="action" />
            <Box>
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
              >
                Order Date
              </Typography>
              <Typography variant="body1">{order.order_date}</Typography>
            </Box>
          </Stack>

          {/* Status Chip */}
          <Box>
            <Typography
              variant="caption"
              color="textSecondary"
              display="block"
              sx={{ mb: 0.5 }}
            >
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

          {/* Products Table Section */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
              Ordered Items
            </Typography>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
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
                      onClick={() => {
                        setSelectedProductId(item.products?.id);
                        setDetailDrawerOpen(true);
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {item.products?.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          SKU: {item.products?.sku || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <ProductDetailsDrawer
            detailDrawerOpen={detailDrawerOpen}
            setDetailDrawerOpen={setDetailDrawerOpen}
            selectedProductId={selectedProductId}
          />

          {/* Notes Section */}
          {order.notes && (
            <Box
              sx={{
                p: 2,
                bgcolor: "#fffbe6",
                border: "1px solid #ffe58f",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                fontWeight="bold"
                color="#856404"
                display="block"
                gutterBottom
              >
                Internal Notes:
              </Typography>
              <Typography variant="body2" color="#856404">
                {order.notes}
              </Typography>
            </Box>
          )}

          {/* Confirm & Ship Button */}
          {(String(order.status_id) === "1" ||
            order.status_display === "Pending") && (
            <Box sx={{ mt: 4, width: "100%" }}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                startIcon={<LocalShippingIcon />}
                onClick={() => {
                  confirmMutation.mutate(); // ستستدعي confirmAndShipOrder
                  setConfirmDialogOpen(false); // تغلق ديالوغ التأكيد وتنتظر النتيجة
                }}
                disabled={confirmMutation.isLoading}
                sx={{
                  py: 1.5,
                  fontWeight: "bold",
                  borderRadius: 2,
                  boxShadow: 3, // إضافة ظل ليبرز الزر
                }}
              >
                {confirmMutation.isLoading
                  ? "Processing..."
                  : "Confirm & Ship Order"}
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: "bold" }}>
          Confirm Shipping
        </DialogTitle>
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
            onClick={() => {
              confirmMutation.mutate();
              setConfirmDialogOpen(false);
            }}
            color="success"
            variant="contained"
            autoFocus
          >
            Confirm & Ship
          </Button>
        </DialogActions>
      </Dialog>

      {/* ديالوغ تنبيه المخزون */}
      <Dialog
        open={errorDialog.open}
        onClose={handleCloseError}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 350 } }}
      >
        <DialogTitle
          sx={{
            color: "error.main",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <WarningAmberIcon color="error" />
          Stock Alert
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="body1">{errorDialog.message}</Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseError}
            variant="contained"
            color="primary"
            fullWidth
          >
            Understood, I'll update the order
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}

// Simple internal helper for table container if needed
const TableContainer = ({ children, component, ...props }) => {
  const Component = component || Box;
  return <Component {...props}>{children}</Component>;
};
