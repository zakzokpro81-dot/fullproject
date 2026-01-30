import { IconButton, Stack ,Button} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const productColumns = (onEdit, onDelete) => [
  //{ field: "id", headerName: "ID", width: 70 },

  {
    field: "name",
    headerName: "Name",
    flex: 1,
  },

  // {
  //   field: "brand",
  //   headerName: "Brand",
  //   flex: 1,
  //   valueGetter: (value, row) => row?.brands?.name || "",
  // },

  // {
  //   field: "family",
  //   headerName: "Family",
  //   flex: 1,
  //   valueGetter: (value, row) => row?.families?.name || "",
  // },

  // {
  //   field: "model",
  //   headerName: "Model",
  //   flex: 1,
  //   valueGetter: (value, row) => row?.models?.name || "",
  // },

  {
    field: "sell_price",
    headerName: "Price",
    width: 120,
  },

  {
    field: "stock",
    headerName: "Stock",
    width: 100,
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
      <>



      
                <Stack direction="row" spacing={1}>
                <IconButton onClick={() => onEdit(params.row)}>
                    <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(params.row)}>
                    <DeleteIcon />
                </IconButton>
            </Stack>



        {/* <Button size="small" onClick={() => onEdit(params.row)}>
          Edit
        </Button>
        <Button
          size="small"
          color="error"
          onClick={() => onDelete(params.row)}
        >
          Delete
        </Button> */}
      </>
    ),
  },
];
