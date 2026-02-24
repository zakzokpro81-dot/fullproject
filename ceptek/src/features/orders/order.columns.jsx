import { Chip } from "@mui/material";

export const orderColumns = [
  { field: "id", headerName: "ID", width: 70 },
  {
    field: "display_date",
    headerName: "Order Date",
    width: 130,
  },
  {
    field: "customer_name",
    headerName: "Customer",
    width: 200,
  },
  {
    field: "status_display",
    headerName: "Status",
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
    headerName: "Notes",
    flex: 1,
  },
];
