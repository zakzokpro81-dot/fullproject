import {
  Drawer,
  Box,
  Typography,
  Stack,
  Divider,
  IconButton,
  Chip,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import NumbersIcon from "@mui/icons-material/Numbers";
import { useTranslation } from "react-i18next";

export default function StockTransactionLogDetailsDrawer({ entry, onClose }) {
  const { t } = useTranslation();
  if (!entry) return null;

  const lineTotal = (entry.quantity || 0) * (entry.unit_cost || 0);

  return (
    <Drawer
      anchor="right"
      open={!!entry}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 480 }, bgcolor: "background.default" },
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
            {t("stockTransactionLogFeature.entryDetails")} #{entry.id}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 3 }} />

        {/* Info Card */}
        <Paper
          variant="outlined"
          sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "background.paper" }}
        >
          <Stack spacing={2.5}>
            {/* Date */}
            <Stack direction="row" spacing={2} alignItems="center">
              <CalendarTodayIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t("stockTransactionLogFeature.entryDate")}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {entry.created_at
                    ? new Date(entry.created_at).toLocaleString()
                    : "N/A"}
                </Typography>
              </Box>
            </Stack>

            {/* Product */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Inventory2OutlinedIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t("stockTransactionLogFeature.product")}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {entry.product_name}
                </Typography>
                {entry.product_sku && (
                  <Typography variant="caption" color="text.secondary">
                    SKU: {entry.product_sku}
                  </Typography>
                )}
              </Box>
            </Stack>

            {/* Warehouse */}
            <Stack direction="row" spacing={2} alignItems="center">
              <WarehouseOutlinedIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t("stockTransactionLogFeature.warehouse")}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {entry.warehouse_name}
                </Typography>
              </Box>
            </Stack>

            {/* Movement Type */}
            <Stack direction="row" spacing={2} alignItems="center">
              <SyncAltIcon color="primary" />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 0.5 }}
                >
                  {t("stockTransactionLogFeature.movementType")}
                </Typography>
                <Chip
                  label={entry.movement_type_name}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: "bold" }}
                />
              </Box>
            </Stack>

            {/* Reference Type */}
            {entry.reference_type && (
              <Stack direction="row" spacing={2} alignItems="center">
                <LabelOutlinedIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t("stockTransactionLogFeature.referenceType")}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {entry.reference_type}
                  </Typography>
                </Box>
              </Stack>
            )}

            {/* Description */}
            {entry.description && (
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <DescriptionOutlinedIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t("stockTransactionLogFeature.description")}
                  </Typography>
                  <Typography variant="body1">{entry.description}</Typography>
                </Box>
              </Stack>
            )}
          </Stack>
        </Paper>

        {/* Quantity & Cost Summary */}
        <Stack spacing={2}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <NumbersIcon color="primary" />
              <Typography variant="subtitle1" fontWeight="bold">
                {t("stockTransactionLogFeature.quantity")}
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              {entry.quantity}
            </Typography>
          </Paper>

          {entry.unit_cost > 0 && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <MonetizationOnOutlinedIcon color="success" />
                <Typography variant="subtitle1" fontWeight="bold">
                  {t("stockTransactionLogFeature.unitCost")}
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                {Number(entry.unit_cost).toLocaleString()}
              </Typography>
            </Paper>
          )}

          {lineTotal > 0 && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderColor: "success.light",
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {t("stockTransactionLogFeature.lineTotal")}
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {lineTotal.toLocaleString()}
              </Typography>
            </Paper>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
