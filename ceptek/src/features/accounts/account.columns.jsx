import { Chip } from "@mui/material";

export const accountColumns = [
  {
    field: "name",
    headerName: "Account Name",
    flex: 1.5,
  },
  {
    field: "account_type",
    headerName: "Type",
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        variant="outlined"
        color={params.value === "bank" ? "primary" : "info"}
      />
    ),
  },
  {
    field: "balance",
    headerName: "Balance",
    width: 130,
    renderCell: (params) => (
      <span
        style={{
          fontWeight: "bold",
          color: params.value >= 0 ? "green" : "red",
        }}
      >
        {params.value.toLocaleString()}
      </span>
    ),
  },
  {
    field: "created_at",
    headerName: "Date",
    width: 180,
    valueGetter: (value, row) => {
      if (!row.created_at) return "N/A";
      const date = new Date(row.created_at);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
    },
  },
];
