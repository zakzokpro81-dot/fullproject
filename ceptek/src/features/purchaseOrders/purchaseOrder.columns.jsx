import { IconButton, Stack, Checkbox } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

export const purchaseOrderColumns = (
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
  { field: "id", headerName: t("purchaseOrders:poNumber"), width: 80 },
  {
    field: "supplier_name",
    headerName: t("purchaseOrders:supplier"),
    flex: 1,
    valueGetter: (value, row) => row?.suppliers?.name || "",
  },
  {
    field: "warehouse_name",
    headerName: t("purchaseOrders:warehouse"),
    flex: 1,
    valueGetter: (value, row) => row?.warehouses?.name || "",
  },
  {
    field: "order_date",
    headerName: t("purchaseOrders:orderDate"),
    width: 130,
    valueGetter: (value) => (value ? new Date(value).toLocaleDateString() : ""),
  },
  {
    field: "total_amount",
    headerName: t("purchaseOrders:totalAmount"),
    width: 140,
    type: "number",
  },
  {
    field: "status_name",
    headerName: t("common:status"),
    width: 130,
    valueGetter: (value, row) => row?.order_statuses?.status_name || "",
  },
  {
    field: "actions",
    headerName: t("common:actions"),
    width: 160,
    sortable: false,
    filterable: false,
    disableExport: true,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onEdit(params.row);
          }}
          color="primary"
        >
          <EditNoteIcon />
        </IconButton>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(params.row);
          }}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </Stack>
    ),
  },
];
