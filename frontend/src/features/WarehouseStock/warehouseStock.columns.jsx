import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const warehouseStockColumns = (onEdit, onDelete) => [
    { field: "id", headerName: "ID", width: 70 },
    { field: "product_name", headerName: "Product", width: 250 },
    { field: "warehouse_name", headerName: "Warehouse", width: 200 },
    { field: "quantity", headerName: "Quantity", width: 120 },
    {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 120,
        getActions: (params) => [
            <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                onClick={() => onEdit(params.row)}
            />,
            <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={() => onDelete(params.row)}
            />,
        ],
    },
];
