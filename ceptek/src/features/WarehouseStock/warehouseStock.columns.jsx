import { IconButton, Checkbox, Stack } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

export const warehouseStockColumns = (
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
  {
    field: "product",
    headerName: t("warehouseStock.product"),
    flex: 1,
    valueGetter: (value, row) => row?.products?.name || "",
  },
  {
    field: "sku",
    headerName: t("warehouseStock.sku"),
    flex: 1,
    valueGetter: (value, row) => row?.products?.sku || "",
  },
  {
    field: "brand",
    headerName: t("warehouseStock.brand"),
    flex: 1,
    valueGetter: (value, row) => row?.products?.brands?.name || "",
  },
  {
    field: "warehouse",
    headerName: t("warehouseStock.warehouse"),
    flex: 1,
    valueGetter: (value, row) => row?.warehouses?.name || "",
  },
  {
    field: "quantity",
    headerName: t("warehouseStock.quantity"),
    width: 120,
  },
  {
    field: "actions",
    headerName: t("common.actions"),
    width: 160,
    sortable: false,
    filterable: false,
    disableExport: true,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(params.row);
          }}
        >
          <EditNoteIcon />
        </IconButton>
        <IconButton
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(params.row);
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Stack>
    ),
  },
];
