import { Chip } from "@mui/material";

export const orderColumns = (t) => [
  { field: "id", headerName: t("common.id"), width: 70 },
  {
    field: "display_date",
    headerName: t("ordersFeature.orderDate"),
    width: 130,
  },
  {
    field: "customer_name",
    headerName: t("ordersFeature.customer"),
    width: 200,
  },
  {
    field: "status_display",
    headerName: t("common.status"),
    width: 130,
    renderCell: (params) => {
      const status = params.value;
      let color = "warning";

      if (status === "Confirmed") color = "info";
      if (status === "Invoiced") color = "success";
      if (status === "Cancelled") color = "error";

      return (
        <Chip
          label={status}
          color={color}
          size="small"
          variant="outlined"
          sx={{ fontWeight: "bold" }}
        />
      );
    },
  },
  {
    field: "notes",
    headerName: t("common.notes"),
    flex: 1,
  },
];
