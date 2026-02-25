import { Checkbox } from "@mui/material";
import ActionColumn from "../../components/ActionColumn";

export const getPurchaseReturnColumns = (
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
    field: "purchase_invoice_item_id",
    headerName: "Invoice Item #",
    width: 130,
  },
  {
    field: "return_date",
    headerName: "Return Date",
    width: 130,
    valueGetter: (value) => (value ? new Date(value).toLocaleDateString() : ""),
  },
  {
    field: "quantity",
    headerName: "Quantity",
    width: 100,
    type: "number",
  },
  {
    field: "credit_amount",
    headerName: "Credit Amount",
    width: 130,
    type: "number",
  },
  {
    field: "status_name",
    headerName: "Status",
    width: 130,
    valueGetter: (value, row) => row?.return_statuses?.status_name || "",
  },
  { field: "reason", headerName: "Reason", flex: 1, minWidth: 180 },
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
