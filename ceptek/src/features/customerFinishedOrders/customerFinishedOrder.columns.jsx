import { Chip, IconButton, Stack } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

export const customerFinishedOrderColumns = (t, onView) => [
  { field: "id", headerName: t("common.id"), width: 70 },
  {
    field: "display_date",
    headerName: t("finishedOrdersFeature.orderDate"),
    width: 120,
  },
  {
    field: "customer_name",
    headerName: t("finishedOrdersFeature.customer"),
    flex: 1,
    minWidth: 140,
  },
  {
    field: "warehouse_name",
    headerName: t("finishedOrdersFeature.warehouse"),
    flex: 1,
    minWidth: 120,
  },
  {
    field: "total_items",
    headerName: t("finishedOrdersFeature.totalItems"),
    width: 100,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "status_display",
    headerName: t("common.status"),
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        color="success"
        size="small"
        variant="outlined"
        sx={{ fontWeight: "bold" }}
      />
    ),
  },
  {
    field: "notes",
    headerName: t("common.notes"),
    flex: 1,
    minWidth: 120,
  },
  {
    field: "actions",
    headerName: t("common.actions"),
    width: 80,
    sortable: false,
    filterable: false,
    disableExport: true,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onView(params.row);
          }}
          color="primary"
          size="small"
        >
          <VisibilityIcon />
        </IconButton>
      </Stack>
    ),
  },
];
