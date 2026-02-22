// 3️⃣ brand.columns.js

// 📌 تعريف أعمدة جدول العرض

// اسم العمود

// العنوان

// هل فيه Actions؟

// هل فيه Toggle؟

// الهدف:
// نفس الجدول ممكن نستخدمه لاحقاً مع DataGrid أو Table ثانية بدون تعديل المنطق
import { Box, Checkbox, IconButton, Tooltip } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

export const brandColumns = ({ onEdit, onDelete, selectedIds, toggleSelect, rows, toggleSelectAll }) => [
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
    renderCell: (params) => (params.value ? "Active" : "Inactive"),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 140,
    sortable: false,
    filterable: false,
    disableExport: true,
    renderCell: (params) => {
      const row = params.row;
      return (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton aria-label="edit brand" onClick={() => onEdit(row)}>
              <EditNoteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              aria-label="delete brand"
              color="error"
              onClick={() => onDelete(row)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
  },
];
