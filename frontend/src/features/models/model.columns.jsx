// هذا الملف يحتوي على تعريف أعمدة DataGrid الخاصة بالموديلات
// مثل:
// id, name, brand, family, actions
// لا يحتوي على منطق الجلب أو الحذف
// فقط تعريف شكل الجدول


import { IconButton, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
export const modelColumns = (onEdit, onDelete) => [
    // {
    //     field: "id",
    //     headerName: "ID",
    //     width: 80,
    // },
    {
        field: "brand",
        headerName: "Brand",
        flex: 1,
        renderCell: (params) => {
            return params.row?.families?.brands?.name || "";
        },
    },
    {
        field: "family",
        headerName: "Family",
        flex: 1,
        renderCell: (params) => {
            return params.row?.families?.name || "";
        },
    },
    {
        field: "name",
        headerName: "Model Name",
        flex: 1,
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
        width: 180,
        renderCell: (params) => (




                <Stack direction="row" spacing={1}>
                <IconButton onClick={() => onEdit(params.row)}>
                    <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(params.row)}>
                    <DeleteIcon />
                </IconButton>
            </Stack>





            // <Stack direction="row" spacing={1}>
            //     <Button
            //         size="small"
            //         variant="outlined"
            //         onClick={() => onEdit(params.row)}
            //     >
            //         Edit
            //     </Button>

            //     <Button
            //         size="small"
            //         color="error"
            //         variant="outlined"
            //         onClick={() => onDelete(params.row)}
            //     >
            //         Delete
            //     </Button>
            // </Stack>
        ),
    },
];
