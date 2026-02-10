import { IconButton, Stack, Checkbox } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const attributeColumns = (onEdit, onDelete) => [
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
    field: "data_type",
    headerName: "Data Type",
    flex: 1,
  },
  {
    field: "has_options",
    headerName: "Has Options",
    width: 150,
    renderCell: (params) => (
      <Checkbox checked={params.value} disabled />
    ),
  },
  {
    field: "is_active",
    headerName: "Active",
    width: 120,
    renderCell: (params) => (
      <Checkbox checked={params.value} disabled />
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 150,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton onClick={() => onEdit(params.row)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => onDelete(params.row.id)}>
          <DeleteIcon />
        </IconButton>
      </Stack>
    ),
  },
];
