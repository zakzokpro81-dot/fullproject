import { IconButton, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const productTypeColumns = (onEdit, onDelete) => [
    {
        field: "id",
        headerName: "ID",
        width: 80,
    },
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
        field: "category",
        headerName: "Category",
        flex: 1,
        renderCell: (params) => params.row?.product_categories?.name || "",
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
                <IconButton color="primary" onClick={() => onEdit(params.row)}>
                    <EditIcon />
                </IconButton>

                <IconButton color="error" onClick={() => onDelete(params.row)}>
                    <DeleteIcon />
                </IconButton>
            </Stack>
        ),
    },
];
