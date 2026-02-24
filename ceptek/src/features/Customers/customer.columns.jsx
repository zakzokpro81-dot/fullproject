import { IconButton, Stack, Chip, Checkbox } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

export const customerColumns = (
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
  { field: "id", headerName: "ID", width: 80 },
  { field: "name", headerName: "Full Name", flex: 1.5 },
  {
    field: "customer_type",
    headerName: "Type",
    flex: 1,
    valueGetter: (value, row) => row?.customer_types?.type_name || "N/A",
  },
  { field: "phone", headerName: "Phone", width: 130 },
  {
    field: "is_active",
    headerName: "Status",
    width: 100,
    renderCell: (params) => (
      <Chip
        label={params.row?.is_active ? "Active" : "Inactive"}
        color={params.row?.is_active ? "success" : "default"}
        size="small"
      />
    ),
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
