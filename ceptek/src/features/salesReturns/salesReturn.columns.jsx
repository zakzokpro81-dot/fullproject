import { Checkbox, Chip } from "@mui/material";
import ActionColumn from "../../components/ActionColumn";

export const getSalesReturnColumns = (
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
    headerName: t("salesReturns:invoiceNumber"),
    width: 130,
    valueGetter: (value, row) =>
      row?.invoices?.invoice_number || `#${row?.invoice_id}`,
  },
  {
    field: "customer_name",
    headerName: t("salesReturns:customer"),
    flex: 1,
    valueGetter: (value, row) => row?.invoices?.customers?.name || "—",
  },
  {
    field: "return_date",
    headerName: t("salesReturns:returnDate"),
    width: 130,
    valueGetter: (value) => (value ? new Date(value).toLocaleDateString() : ""),
  },
  {
    field: "quantity",
    headerName: t("salesReturns:quantity"),
    width: 100,
    type: "number",
  },
  {
    field: "refund_amount",
    headerName: t("salesReturns:refundAmount"),
    width: 130,
    type: "number",
  },
  {
    field: "status_name",
    headerName: t("common:status"),
    width: 130,
    renderCell: (params) => {
      const statusName = params.row?.return_statuses?.status_name || "";
      const colorMap = {
        pending: "warning",
        approved: "success",
        rejected: "error",
      };
      return (
        <Chip
          label={statusName}
          color={colorMap[statusName?.toLowerCase()] || "default"}
          size="small"
          variant="outlined"
        />
      );
    },
  },
  {
    field: "reason",
    headerName: t("salesReturns:reason"),
    flex: 1,
    minWidth: 180,
  },
  {
    field: "actions",
    headerName: t("common:actions"),
    width: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <ActionColumn params={params} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];
