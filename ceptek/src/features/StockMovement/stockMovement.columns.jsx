import { Chip, Typography, Box } from "@mui/material";

export const stockMovementColumns = [
  {
    field: "product_name",
    headerName: "Product",
    flex: 1.5,
    valueGetter: (value, row) => row?.products?.name || "N/A",
  },
  {
    field: "sku",
    headerName: "SKU",
    width: 120,
    valueGetter: (value, row) => row?.products?.sku || "N/A",
  },
  {
    field: "quantity",
    headerName: "Qty",
    width: 100,
    renderCell: (params) => {
      // Outgoing movement types (red): 2=out, 7=Sales, 9=Purchase Return, 12=Damaged
      const outgoingIds = [2, 7, 9, 12];
      const isOutgoing = outgoingIds.includes(params.row.movement_type_id);
      const value = params.value || 0;

      return (
        <Typography
          sx={{
            color: isOutgoing ? "error.main" : "success.main",
            fontWeight: "bold",
          }}
        >
          {isOutgoing ? `-${Math.abs(value)}` : `+${Math.abs(value)}`}
        </Typography>
      );
    },
  },
  {
    field: "unit_cost",
    headerName: "Unit Cost",
    width: 120,
    renderCell: (params) => (
      <Typography>
        {params.row.unit_cost
          ? `${params.row.unit_cost.toLocaleString()} $`
          : "0.00 $"}
      </Typography>
    ),
  },
  {
    field: "warehouse",
    headerName: "Warehouse",
    width: 150,
    valueGetter: (value, row) => row?.warehouses?.name || "N/A",
  },
  {
    field: "movement_type",
    headerName: "Type",
    width: 150,
    valueGetter: (value, row) =>
      row?.stock_movement_types?.movement_name || "N/A",
    renderCell: (params) => {
      const outgoingIds = [2, 7, 9, 12];
      const isOutgoing = outgoingIds.includes(params.row.movement_type_id);
      return (
        <Chip
          label={params.value}
          size="small"
          variant="filled"
          color={isOutgoing ? "error" : "success"}
          sx={{ fontWeight: "bold", textTransform: "capitalize" }}
        />
      );
    },
  },
  {
    field: "created_at",
    headerName: "Date",
    width: 180,
    valueGetter: (value, row) => {
      if (!row.created_at) return "N/A";
      const date = new Date(row.created_at);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleString("en-GB");
    },
  },
  {
    field: "description",
    headerName: "Description",
    width: 180,
  },
];
