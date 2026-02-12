import { IconButton, Stack, Chip, Checkbox } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const customerColumns = (
  onEdit,
  onDelete,
  selectedIds,
  toggleSelect,
  rows,
  toggleSelectAll,
) => [
  {
    field: "selection",
    headerName: "",
    width: 50,
    sortable: false,
    renderHeader: () => (
      <Checkbox
        // حماية: التأكد من وجود rows قبل قراءة الطول
        indeterminate={
          selectedIds.size > 0 && selectedIds.size < (rows?.length || 0)
        }
        checked={(rows?.length || 0) > 0 && selectedIds.size === rows?.length}
        onChange={toggleSelectAll}
      />
    ),
    renderCell: (params) => (
      <Checkbox
        // حماية: التأكد من وجود params.row
        checked={params?.row ? selectedIds.has(params.row.id) : false}
        onChange={() => params?.row && toggleSelect(params.row.id)}
        onClick={(e) => e.stopPropagation()}
      />
    ),
  },
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Full Name", flex: 1.5 },
  {
    field: "customer_type",
    headerName: "Type",
    flex: 1,
    // التعديل الجذري: نستخدم renderCell بدلاً من valueGetter لضمان الوصول للـ Row
    renderCell: (params) => {
      // نصل للبيانات مباشرة من الكائن الذي رأيناه في الـ Console
      const typeName = params?.row?.customer_types?.type_name;
      return typeName || "N/A";
    },
  },
  { field: "phone", headerName: "Phone", width: 130 },
  {
    field: "is_active",
    headerName: "Status",
    width: 100,
    renderCell: (params) => (
      <Chip
        label={params?.row?.is_active ? "Active" : "Inactive"}
        color={params?.row?.is_active ? "success" : "default"}
        size="small"
      />
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 110,
    sortable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={0.5}>
        <IconButton
          color="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            if (params?.row) onEdit(params.row);
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="error"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            if (params?.row) onDelete(params.row);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    ),
  },
];
