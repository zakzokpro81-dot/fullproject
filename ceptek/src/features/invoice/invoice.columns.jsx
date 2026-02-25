import { Chip, Typography } from "@mui/material";

export const invoiceColumns = (t) => [
  { field: "id", headerName: t("invoiceFeature.invNumber"), width: 90 },
  { field: "customer_name", headerName: t("invoiceFeature.customer"), width: 150 },
  {
    field: "total_amount",
    headerName: t("invoiceFeature.total"),
    width: 120,
    renderCell: (params) => (
      <Typography fontWeight="bold">{params.value}</Typography>
    ),
  },
  { field: "account_name", headerName: t("invoiceFeature.account"), width: 150 },
  {
    field: "status_name",
    headerName: t("common.status"),
    width: 130,
    renderCell: (params) => {
      const status = params.value;
      const color =
        status === "Paid"
          ? "success"
          : status === "Partial"
            ? "warning"
            : "error";
      return <Chip label={status} color={color} size="small" />;
    },
  },
  {
    field: "invoice_date",
    headerName: t("common.date"),
    width: 180,
    valueGetter: (value) => new Date(value).toLocaleString(),
  },
];
