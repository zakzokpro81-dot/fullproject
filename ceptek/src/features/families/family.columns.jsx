// family.columns.js
// تعريف أعمدة DataGrid لميزة Families
// تشمل الأعمدة الأساسية وأزرار Actions (Edit / Delete)
// callback يتم تمريره من FamilyList.jsx
import { IconButton, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const familyColumns = (onEdit, onDelete) => [
    {
        field: "id",
        headerName: "ID",
        width: 80,
    },
    {
        field: "name",
        headerName: "Family Name",
        flex: 1,
    },
    {
        field: "brand_name",
        headerName: "Brand",
        width: 150,
        valueGetter: (value, row) => row?.brands?.name || ""
    },
    {
        field: "product_type_id",
        headerName: "product_type_id",
        width: 150,
        valueGetter: (value, row) => row?.product_types?.name || ""
    },



    {
        field: "is_active",
        headerName: "Active",
        width: 120,
        renderCell: (params) => (params.value ? "Yes" : "No"),
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
