import { IconButton, Checkbox, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export const stockColumns = (onDelete, selectedIds, toggleSelect, rows = [], toggleSelectAll) => [
  {
    field: "select",
    headerName: "",
    width: 60,
    renderHeader: () => (
      <Checkbox
        checked={rows.length > 0 && selectedIds.length === rows.length}
        indeterminate={selectedIds.length > 0 && selectedIds.length < rows.length}
        onChange={toggleSelectAll}
      />
    ),
    renderCell: (params) => (
      <Checkbox
        checked={selectedIds.includes(params.row.id)}
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
    width: 100,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton color="error" onClick={() => onDelete(params.row)}>
          <DeleteIcon />
        </IconButton>
      </Stack>
    ),
  },
];
