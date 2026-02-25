import { Chip, Checkbox } from "@mui/material";
import ActionColumn from "../../components/ActionColumn";

const methodColors = {
  cash: "success",
  bank: "primary",
  check: "warning",
};

export const getSupplierPaymentColumns = (
  onEdit,
  onDelete,
  selectedIds,
  toggleSelect,
  rows = [],
  toggleSelectAll,
) => [
  {
    field: "select",
    headerName: "",
    width: 60,
    sortable: false,
    disableColumnMenu: true,
    renderHeader: () => {
      const allSelected =
        rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
      return (
        <Checkbox
          checked={allSelected}
          indeterminate={selectedIds.size > 0 && !allSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={toggleSelectAll}
        />
      );
    },
    renderCell: (params) => (
      <Checkbox
        checked={selectedIds.has(params.row.id)}
        onClick={(e) => e.stopPropagation()}
        onChange={() => toggleSelect(params.row.id)}
      />
    ),
  },
  { field: "id", headerName: "ID", width: 70 },
  {
    field: "invoice_number",
    headerName: "Invoice",
    flex: 1,
    minWidth: 140,
    valueGetter: (value, row) =>
      row?.purchase_invoices?.invoice_number || `#${row?.purchase_invoice_id}`,
  },
  {
    field: "account_name",
    headerName: "Account",
    flex: 1,
    minWidth: 140,
    valueGetter: (value, row) => row?.accounts?.name || "—",
  },
  {
    field: "payment_date",
    headerName: "Payment Date",
    width: 130,
    valueGetter: (value) => (value ? new Date(value).toLocaleDateString() : ""),
  },
  {
    field: "amount",
    headerName: "Amount",
    width: 120,
    type: "number",
  },
  {
    field: "method",
    headerName: "Method",
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        color={methodColors[params.value] || "default"}
        size="small"
      />
    ),
  },
  { field: "notes", headerName: "Notes", flex: 1, minWidth: 150 },
  {
    field: "actions",
    headerName: "Actions",
    width: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <ActionColumn
        onEdit={() => onEdit(params.row)}
        onDelete={() => onDelete(params.row)}
      />
    ),
  },
];
