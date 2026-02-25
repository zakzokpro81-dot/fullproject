import { Checkbox } from "@mui/material";
import ActionColumn from "../../components/ActionColumn";

export const getPurchaseReturnColumns = (
  onEdit,
  onDelete,
  selectedIds,
  toggleSelect,
  rows = [],
  toggleSelectAll,
  t,
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
    headerName: t("purchaseReturns.invoiceItemNumber"),
    width: 130,
  },
  {
    field: "return_date",
    headerName: t("purchaseReturns.returnDate"),
    width: 130,
    valueGetter: (value) => (value ? new Date(value).toLocaleDateString() : ""),
  },
  {
    field: "quantity",
    headerName: t("purchaseReturns.quantity"),
    width: 100,
    type: "number",
  },
  {
    field: "credit_amount",
    headerName: t("purchaseReturns.creditAmount"),
    width: 130,
    type: "number",
  },
  {
    field: "status_name",
    headerName: t("common.status"),
    width: 130,
    valueGetter: (value, row) => row?.return_statuses?.status_name || "",
  },
  { field: "reason", headerName: t("purchaseReturns.reason"), flex: 1, minWidth: 180 },
  {
    field: "actions",
    headerName: t("common.actions"),
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
