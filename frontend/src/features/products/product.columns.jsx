import { IconButton, Stack ,Button} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const productColumns = (onEdit, onDelete) => [
  //{ field: "id", headerName: "ID", width: 70 },

  {
    field: "name",
    headerName: "Name",
    flex: 1,
    minWidth: 150
  },

  {
    field:"product_type" ,
    headerName: "product_type",
    width: 120,
    valueGetter: (value, row) => row?.product_type?.name || "N/A",
  },
  {
    field: "sell_price",
    headerName: "sell_price",
    width: 80,
  },
   {
    field: "cost_price",
    headerName: "cost_price",
    width: 80,
  },


  {
    field: "stock",
    headerName: "Stock",
    width: 70,
  },
  {
    field: "description",
    headerName: "description  ",
    width: 100,
  },

{
    field: "actions",
    headerName: "Actions",
    width: 160,
    renderCell: (params) => (
        <Stack direction="row" spacing={1}>
            <IconButton 
                onClick={(e) => {
                    e.stopPropagation(); // يمنع فتح الـ Drawer
                    onEdit(params.row);
                    
                }}
                color="error"
            >
                <EditIcon  />
            </IconButton>
            
            <IconButton 
                onClick={(e) => {
                    e.stopPropagation(); // يمنع فتح الـ Drawer
                    onDelete(params.row);
                }}
                 color="primary"
            >
                <DeleteIcon />
            </IconButton>
        </Stack>
    ),
},
];
