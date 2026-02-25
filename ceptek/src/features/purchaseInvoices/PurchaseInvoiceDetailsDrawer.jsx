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
import { useTranslation } from "react-i18next";
import { usePurchaseInvoiceItems } from "./purchaseInvoice.hooks";

export default function PurchaseInvoiceDetailsDrawer({ invoice, onClose }) {
  const { t } = useTranslation();
  const { items, isLoading } = usePurchaseInvoiceItems(invoice?.id);

  if (!invoice) return null;

  const supplierName = invoice.suppliers?.name || "—";
  const statusName = invoice.invoice_statuses?.status_name || "—";

  return (
    <Drawer
      anchor="right"
      open={!!invoice}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 500 } } }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" fontWeight="bold">
            {t("purchaseInvoices.entity")} #
            {invoice.invoice_number || invoice.id}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Info */}
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon color="action" />
            <Typography variant="body1">{supplierName}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarTodayIcon color="action" />
            <Typography variant="body2">
              {invoice.invoice_date
                ? new Date(invoice.invoice_date).toLocaleDateString()
                : "—"}
            </Typography>
          </Stack>
          <Chip
            label={statusName}
            color={
              statusName === "Paid"
                ? "success"
                : statusName === "Partial"
                  ? "warning"
                  : "default"
            }
            sx={{ width: "fit-content" }}
            size="small"
          />
        </Stack>

        {/* Payment Summary */}
        <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fafafa", mb: 3 }}>
          <Typography fontWeight="bold" gutterBottom>
            {t("purchaseInvoices.paymentSummary")}
          </Typography>
          <Stack spacing={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">
                {t("purchaseInvoices.totalAmount")}:
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {Number(invoice.total_amount || 0).toFixed(2)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">
                {t("purchaseInvoices.paidAmount")}:
              </Typography>
              <Typography variant="body2" color="success.main">
                {Number(invoice.paid_amount || 0).toFixed(2)}
              </Typography>
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">
                {t("purchaseInvoices.balance")}:
              </Typography>
              <Typography variant="body2" color="error.main" fontWeight="bold">
                {(
                  Number(invoice.total_amount || 0) -
                  Number(invoice.paid_amount || 0)
                ).toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Items */}
        <Typography fontWeight="bold" sx={{ mb: 1 }}>
          {t("purchaseInvoices.items")}
        </Typography>

        {isLoading ? (
          <Typography variant="caption">{t("common.loading")}...</Typography>
        ) : items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t("purchaseInvoices.noItems")}
          </Typography>
        ) : (
          <Paper variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>{t("purchaseInvoices.product")}</TableCell>
                  <TableCell align="center">
                    {t("purchaseInvoices.qty")}
                  </TableCell>
                  <TableCell align="right">
                    {t("purchaseInvoices.unitCost")}
                  </TableCell>
                  <TableCell align="right">
                    {t("purchaseInvoices.lineTotal")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.products?.name || `Product #${item.product_id}`}
                      </Typography>
                      {item.products?.sku && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          display="block"
                        >
                          SKU: {item.products.sku}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">
                      {Number(item.unit_cost).toFixed(2)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {Number(item.total_cost).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>
    </Drawer>
  );
}
