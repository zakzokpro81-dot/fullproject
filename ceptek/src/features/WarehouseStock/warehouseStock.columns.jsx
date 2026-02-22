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
    headerName: "Product",
    flex: 1,
    valueGetter: (value, row) => row?.products?.name || "",
  },
  {
    field: "sku",
    headerName: "SKU",
    flex: 1,
    valueGetter: (value, row) => row?.products?.sku || "",
  },
  {
    field: "brand",
    headerName: "Brand",
    flex: 1,
    valueGetter: (value, row) => row?.products?.brands?.name || "",
  },
  {
    field: "warehouse",
    headerName: "Warehouse",
    flex: 1,
    valueGetter: (value, row) => row?.warehouses?.name || "",
  },
  {
    field: "quantity",
    headerName: "Quantity",
    width: 120,
  },
  {
    field: "actions",
    headerName: "Actions",
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
