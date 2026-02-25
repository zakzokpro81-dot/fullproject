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
  { field: "id", headerName: t("common.id", "ID"), width: 70 },
  {
    field: "invoice_number",
    headerName: t("supplierPayments.invoice"),
    flex: 1,
    minWidth: 140,
    valueGetter: (value, row) =>
      row?.purchase_invoices?.invoice_number || `#${row?.purchase_invoice_id}`,
  },
  {
    field: "account_name",
    headerName: t("supplierPayments.account"),
    flex: 1,
    minWidth: 140,
    valueGetter: (value, row) => row?.accounts?.name || "—",
  },
  {
    field: "payment_date",
    headerName: t("supplierPayments.paymentDate"),
    width: 130,
    valueGetter: (value) => (value ? new Date(value).toLocaleDateString() : ""),
  },
  {
    field: "amount",
    headerName: t("common.amount"),
    width: 120,
    type: "number",
  },
  {
    field: "method",
    headerName: t("supplierPayments.paymentMethod"),
    width: 120,
    renderCell: (params) => (
      <Chip
        label={t(`supplierPayments.${params.value}`)}
        color={methodColors[params.value] || "default"}
        size="small"
      />
    ),
  },
  { field: "notes", headerName: t("common.notes"), flex: 1, minWidth: 150 },
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
