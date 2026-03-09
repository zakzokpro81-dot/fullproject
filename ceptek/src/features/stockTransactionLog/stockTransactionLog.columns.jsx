import { Chip, IconButton, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

export const stockTransactionLogColumns = (t, onView) => [
  { field: "id", headerName: t("common.id"), width: 70 },
  {
    field: "display_date",
    headerName: t("stockTransactionLogFeature.entryDate"),
    width: 120,
  },
  {
    field: "product_name",
    headerName: t("stockTransactionLogFeature.product"),
    flex: 1,
    minWidth: 160,
  },
  {
    field: "product_sku",
    headerName: t("stockTransactionLogFeature.sku"),
    width: 110,
  },
  {
    field: "warehouse_name",
    headerName: t("stockTransactionLogFeature.warehouse"),
    flex: 1,
    minWidth: 130,
  },
  {
    field: "movement_type_name",
    headerName: t("stockTransactionLogFeature.movementType"),
    width: 150,
    renderCell: (params) => (
      <Chip
        label={params.value}
        color="primary"
        size="small"
        variant="outlined"
        sx={{ fontWeight: "bold" }}
      />
    ),
  },
  {
    field: "quantity",
    headerName: t("stockTransactionLogFeature.quantity"),
    width: 90,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => (
      <Typography variant="body2" fontWeight="bold">
        {params.value}
      </Typography>
    ),
  },
  {
    field: "unit_cost",
    headerName: t("stockTransactionLogFeature.unitCost"),
    width: 110,
    align: "right",
    headerAlign: "right",
    renderCell: (params) =>
      params.value > 0 ? (
        <Typography variant="body2">
          {Number(params.value).toLocaleString()}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.disabled">
          —
        </Typography>
      ),
  },
  {
    field: "reference_type",
    headerName: t("stockTransactionLogFeature.referenceType"),
    width: 130,
  },
  {
    field: "actions",
    headerName: t("common.actions"),
    width: 80,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <IconButton
        size="small"
        color="primary"
        onClick={(e) => {
          e.stopPropagation();
          onView(params.row);
        }}
        title={t("common.openDrawer")}
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>
    ),
  },
];
