// 3️⃣ brand.columns.js

// 📌 تعريف أعمدة جدول العرض

// اسم العمود

// العنوان

// هل فيه Actions؟

// هل فيه Toggle؟

// الهدف:
// نفس الجدول ممكن نستخدمه لاحقاً مع DataGrid أو Table ثانية بدون تعديل المنطق
import { Box, IconButton } from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';

export const brandColumns = (onEdit, onDelete) => [
  {
    field: "name",
    headerName: "Brand Name",
    flex: 1,
  },
  {
    field: "slug",
    headerName: "Slug",
    flex: 1,
  },
  {
    field: "is_active",
    headerName: "Status",
    width: 120,
    renderCell: (params) =>
      params.value ? "Active" : "Inactive",
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 160,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const row = params.row;

      return (
        <>
          <Box >
            <IconButton onClick={() => onEdit(row)}>
              <EditNoteIcon />
            </IconButton>
            <IconButton onClick={() => onDelete(row )}>

              <DeleteIcon />

            </IconButton>
          </Box>

        </>
      );
    },
  },
];
