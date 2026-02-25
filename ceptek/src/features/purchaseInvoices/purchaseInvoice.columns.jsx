import { Checkbox } from "@mui/material";
import ActionColumn from "../../components/ActionColumn";

export const getPurchaseInvoiceColumns = (
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
    headerName: "Invoice Number",
    flex: 1,
    minWidth: 130,
  },
  {
    field: "supplier_name",
    headerName: "Supplier",
    flex: 1,
    minWidth: 150,
    valueGetter: (value, row) => row?.suppliers?.name || "",
  },
  {
    field: "purchase_order_id",
    headerName: "PO #",
    width: 90,
    valueGetter: (value, row) => row?.purchase_order_id || "—",
  },
  {
    field: "invoice_date",
    headerName: "Invoice Date",
    width: 130,
    valueGetter: (value) => (value ? new Date(value).toLocaleDateString() : ""),
  },
  {
    field: "total_amount",
    headerName: "Total Amount",
    width: 130,
    type: "number",
  },
  {
    field: "paid_amount",
    headerName: "Paid Amount",
    width: 130,
    type: "number",
  },
  {
    field: "status_name",
    headerName: "Status",
    width: 130,
    valueGetter: (value, row) => row?.invoice_statuses?.status_name || "",
  },
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
