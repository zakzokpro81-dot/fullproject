import { IconButton, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const productTypeAttributesColumns = (onEdit, onDelete) => [
    {
        field: "id",
        headerName: "ID",
        width: 80,
    },

    {
        field: "product_type",
        headerName: "Product Type",
        flex: 1,
        valueGetter: (value, row) => row?.product_types?.name || "",
    },

    {
        field: "attribute",
        headerName: "Attribute",
        flex: 1,
        valueGetter: (value, row) => row?.attributes?.name || "",
    },

    {
        field: "actions",
        headerName: "Actions",
        width: 120,
        renderCell: ({ row }) => (
            <Stack direction="row" spacing={1}>
                <IconButton color="primary" onClick={() => onEdit(row)}>
                    <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => onDelete(row)}>
                    <DeleteIcon />
                </IconButton>
            </Stack>
        ),
    },
];
