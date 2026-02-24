import { IconButton, Stack, Checkbox } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

export const productTypeAttributesColumns = (
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
    field: "id",
    headerName: "ID",
    width: 80,
  },
  {
    field: "product_type",
    headerName: "Product Type",
    flex: 1,
    valueGetter: (value, row) => row?.product_types?.name || "",
  },
  {
    field: "attribute",
    headerName: "Attribute",
    flex: 1,
    valueGetter: (value, row) => row?.attributes?.name || "",
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 120,
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
        >
          <EditNoteIcon />
        </IconButton>
        <IconButton
          color="error"
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
