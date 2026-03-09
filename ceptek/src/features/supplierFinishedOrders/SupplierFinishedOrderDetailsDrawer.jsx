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
import StorefrontIcon from "@mui/icons-material/Storefront";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import InventoryIcon from "@mui/icons-material/Inventory";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useTranslation } from "react-i18next";

export default function SupplierFinishedOrderDetailsDrawer({ order, onClose }) {
  const { t } = useTranslation();
  if (!order) return null;

  const items = order.raw_items || [];

  return (
    <Drawer
      anchor="right"
      open={!!order}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 520 }, bgcolor: "background.default" },
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
            {t("supplierFinishedOrdersFeature.orderDetails")} #{order.id}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 3 }} />

        {/* Info Cards */}
        <Paper
          variant="outlined"
          sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "background.paper" }}
        >
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} alignItems="center">
              <StorefrontIcon color="primary" />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("supplierFinishedOrdersFeature.supplier")}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {order.supplier_name}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <WarehouseIcon color="primary" />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("supplierFinishedOrdersFeature.warehouse")}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {order.warehouse_name}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <CalendarTodayIcon color="primary" />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("supplierFinishedOrdersFeature.orderDate")}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {order.order_date
                    ? new Date(order.order_date).toLocaleDateString()
                    : "N/A"}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <AttachMoneyIcon color="primary" />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("supplierFinishedOrdersFeature.totalAmount")}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {order.total_amount != null
                    ? order.total_amount.toLocaleString()
                    : "—"}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <StorefrontIcon color="primary" />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 0.5 }}
                >
                  {t("common.status")}
                </Typography>
                <Chip
                  label={order.status_display}
                  color="success"
                  size="small"
                  sx={{ fontWeight: "bold" }}
                />
              </Box>
            </Stack>
          </Stack>
        </Paper>

        {/* Items Table */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <InventoryIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight="bold">
              {t("supplierFinishedOrdersFeature.orderedItems")} ({items.length})
            </Typography>
          </Stack>
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, overflow: "hidden" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "primary.main" }}>
                  <TableCell
                    sx={{ fontWeight: "bold", color: "primary.contrastText" }}
                  >
                    {t("supplierFinishedOrdersFeature.product")}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", color: "primary.contrastText" }}
                  >
                    SKU
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", color: "primary.contrastText" }}
                  >
                    {t("supplierFinishedOrdersFeature.qty")}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: "bold", color: "primary.contrastText" }}
                  >
                    {t("supplierFinishedOrdersFeature.unitCost")}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: "bold", color: "primary.contrastText" }}
                  >
                    {t("supplierFinishedOrdersFeature.lineTotal")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => {
                  const cost = item.unit_cost || 0;
                  const lineTotal =
                    item.total_cost || cost * (item.quantity || 0);
                  return (
                    <TableRow key={item.id || index} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {item.products?.name || "Unknown"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {item.products?.sku || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.quantity}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {cost.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {lineTotal.toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>

          {/* Grand Total */}
          {items.length > 0 && (
            <Paper
              variant="outlined"
              sx={{
                mt: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: "success.50",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {t("supplierFinishedOrdersFeature.grandTotal")}
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {items
                  .reduce(
                    (sum, item) =>
                      sum +
                      (item.total_cost ||
                        (item.unit_cost || 0) * (item.quantity || 0)),
                    0,
                  )
                  .toLocaleString()}
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Notes */}
        {order.notes && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: "warning.50",
              borderColor: "warning.light",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="caption"
              fontWeight="bold"
              color="warning.dark"
              display="block"
              gutterBottom
            >
              {t("common.notes")}:
            </Typography>
            <Typography variant="body2" color="warning.dark">
              {order.notes}
            </Typography>
          </Paper>
        )}
      </Box>
    </Drawer>
  );
}
