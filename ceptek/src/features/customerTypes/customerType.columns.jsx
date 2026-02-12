import { IconButton, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const customerTypeColumns = (onEdit, onDelete) => [
  {
    field: "id",
    headerName: "ID",
    width: 90,
  },
  {
    field: "type_name",
    headerName: "نوع الزبون",
    flex: 1,
  },
  {
    field: "actions",
    headerName: "الإجراءات",
    width: 120,
    sortable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton
          color="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // لمنع تفعيل حدث ضغط الصف
            onEdit(params.row);
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="error"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(params.row);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    ),
  },
];
