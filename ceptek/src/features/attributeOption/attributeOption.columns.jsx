import { IconButton, Stack, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const attributeOptionColumns = (onEdit, onDelete) => [
    {
        field: "attribute_id",
        headerName: "Attribute",
        flex: 1,
        valueGetter: (value, row) => row?.attributes?.name || "",
    },
    {
        field: "data_type",
        headerName: "Data Type",
        flex: 1,
        valueGetter: (value, row) => row?.attributes?.data_type || "",
    },
    {
        field: "value",
        headerName: "Value",
        flex: 1,
    },
    {
        field: "slug",
        headerName: "Slug",
        flex: 1,
    },
    {
        field: "is_active",
        headerName: "Active",
        flex: 1,
        valueGetter: (value, row) => row?.attributes?.is_active ? "Yes" : "No",
    },
    {
        field: "actions",
        headerName: "Actions",
        width: 120,
        renderCell: (params) => (
            <Stack direction="row" spacing={1}>
                <IconButton size="small" onClick={() => onEdit(params.row)}>
                    <EditIcon />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => onDelete(params.row)}>
                    <DeleteIcon />
                </IconButton>
            </Stack>
        ),
    },
];
