import { Chip } from "@mui/material";

export const invoiceColumns = [
  { field: "id", headerName: "Inv #", width: 90 },
  {
    field: "customer_name",
    headerName: "Customer",
    width: 150,
    valueGetter: (value, row) => row.customers?.name || "Cash Customer",
  },
  {
    field: "total_amount",
    headerName: "Total",
    width: 120,
    renderCell: (params) => (
      <span style={{ fontWeight: "bold" }}>{params.value}</span>
    ),
  },
  // أضف هذا العمود لمصفوفة invoiceColumns
{
  field: "account_name", // هذا الاسم يجب أن يطابق ما يرسله الـ API
  headerName: "Box / Account",
  width: 150,
  renderCell: (params) => (
    <span style={{ color: "#1a237e", fontWeight: "500" }}>
      {params.value || "No Account"}
    </span>
  ),
},
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => {
      const status = params.row.invoice_statuses?.status_name;
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
    headerName: "Date",
    width: 180,
    valueGetter: (value) => new Date(value).toLocaleString(),
  },
];
