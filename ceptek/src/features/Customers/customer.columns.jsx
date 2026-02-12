import { IconButton, Stack, Checkbox } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const customerColumns = (
  onEdit,
  onDelete,
  selectedIds,
  toggleSelect,
  rows = [],
  toggleSelectAll
) => [
  {
    field: "select",
    headerName: "",
    width: 60,
    sortable: false,
    filterable: false,
    renderHeader: () => {
      const allSelected =
        rows.length > 0 && rows.every((r) => selectedIds.has(r.id));

      return (
        <Checkbox
          checked={allSelected}
          indeterminate={
            selectedIds.size > 0 && !allSelected
          }
          onChange={toggleSelectAll}
        />
      );
    },
    renderCell: (params) => (
      <Checkbox
        checked={selectedIds.has(params.row.id)}
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
    field: "name",
    headerName: "Customer Name",
    flex: 1,
  },
  {
    field: "store_name",
    headerName: "Store Name",
    flex: 1,
  },
  {
    field: "phone",
    headerName: "Phone",
    flex: 1,
  },
  {
    field: "email",
    headerName: "Email",
    flex: 1,
  },
  {
    field: "customer_type_id",
    headerName: "Customer Type",
    flex: 1,
    valueGetter: (value, row) =>
      row?.customer_types?.type_name || "",
  },
  {
    field: "is_active",
    headerName: "Active",
    width: 100,
    renderCell: (params) => (params.value ? "Yes" : "No"),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton size="small" onClick={() => onEdit(params.row)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(params.row)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    ),
  },
];
