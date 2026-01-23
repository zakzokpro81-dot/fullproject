// src/features/families/family.columns.js
import { Box, IconButton } from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';


export const familyColumns = (onEdit, onDelete) => [
    {
        field: "name",
        headerName: "Family Name",
        flex: 1,
    },
    {
        field: "slug",
        headerName: "Slug",
        flex: 1,
    },
    {
    field: "brandName",
    headerName: "Brand",
    flex: 1,
    valueGetter: (params) => params?.row?.brand?.name || "—", // ← تحقق من كل شيء
  },
    {
        field: "category",
        headerName: "Category",
        flex: 1,
        valueGetter: (params) => params.row.category?.name || params.row.category,
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
        width: 160,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
            const row = params.row;
            return (
                <Box>
                    <IconButton onClick={() => onEdit(row)}>
                        <EditNoteIcon />
                    </IconButton>
                    <IconButton onClick={() => onDelete(row)}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            );
        },
    },
];
