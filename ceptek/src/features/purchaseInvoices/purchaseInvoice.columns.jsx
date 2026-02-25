import { Checkbox } from "@mui/material";
import ActionColumn from "../../components/ActionColumn";

export const getPurchaseInvoiceColumns = (
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
    field: "invoice_number",
    headerName: t("purchaseInvoices.invoiceNumber"),
    flex: 1,
    minWidth: 130,
  },
  {
    field: "supplier_name",
    headerName: t("purchaseInvoices.supplier"),
    flex: 1,
    minWidth: 150,
    valueGetter: (value, row) => row?.suppliers?.name || "",
  },
  {
    field: "purchase_order_id",
    headerName: t("purchaseInvoices.purchaseOrder"),
    width: 90,
    valueGetter: (value, row) => row?.purchase_order_id || "—",
  },
  {
    field: "invoice_date",
    headerName: t("purchaseInvoices.invoiceDate"),
    width: 130,
    valueGetter: (value) => (value ? new Date(value).toLocaleDateString() : ""),
  },
  {
    field: "total_amount",
    headerName: t("purchaseInvoices.totalAmount"),
    width: 130,
    type: "number",
  },
  {
    field: "paid_amount",
    headerName: t("purchaseInvoices.paidAmount"),
    width: 130,
    type: "number",
  },
  {
    field: "status_name",
    headerName: t("common.status"),
    width: 130,
    valueGetter: (value, row) => row?.invoice_statuses?.status_name || "",
  },
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
