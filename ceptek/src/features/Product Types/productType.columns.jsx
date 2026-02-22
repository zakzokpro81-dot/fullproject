import { IconButton, Stack, Checkbox } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

export const productTypeColumns = (
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
    field: "name",
    headerName: "Name",
    flex: 1,
  },
  {
    field: "slug",
    headerName: "Slug",
    flex: 1,
  },
  {
    field: "category",
    headerName: "Category",
    flex: 1,
    valueGetter: (value, row) => row?.product_categories?.name || "",
  },
  {
    field: "is_active",
    headerName: "Active",
    width: 120,
    renderCell: (params) => (params.value ? "Active" : "Inactive"),
  },
  {
    field: "variant_strategy_id",
    headerName: "Product Structure",
    flex: 1,
    valueGetter: (value, row) => row?.variant_strategies?.name || "",
  },
  {
    field: "tracking_type_id",
    headerName: "Tracking Type",
    flex: 1,
    valueGetter: (value, row) => row?.tracking_types?.name || "",
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
          onClick={(e) => {
            e.stopPropagation();
            onEdit(params.row);
          }}
          color="error"
        >
          <EditNoteIcon />
        </IconButton>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(params.row);
          }}
          color="primary"
        >
          <DeleteIcon />
        </IconButton>
      </Stack>
    ),
  },
];
