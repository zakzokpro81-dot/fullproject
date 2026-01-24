// src/features/products/product.columns.js
import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const productColumns = (onEdit, onDelete) => [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'المنتج', flex: 1 },
    { field: 'brand_name', headerName: 'Brand', width: 120 },
    { field: 'family_name', headerName: 'Family', width: 120 },
    { field: 'model_name', headerName: 'Model', width: 120 },
    { field: 'sell_price', headerName: 'سعر البيع', width: 100 },
    { field: 'stock', headerName: 'Stock', width: 80 },
    { field: 'is_active', headerName: 'فعال', width: 80 },
    {
        field: 'actions',
        type: 'actions',
        headerName: 'إجراءات',
        width: 100,
        getActions: (params) => [
            <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => onEdit(params.row)} />,
            <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => onDelete(params.row)} />,
        ],
    },
];
