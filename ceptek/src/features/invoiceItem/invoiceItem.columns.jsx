import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export const invoiceItemColumns = (onDelete) => [
  {
    field: "product_name",
    headerName: "Product",
    flex: 2,
    valueGetter: (value, row) =>
      row?.product_variants?.products?.name || "Unknown Product",
  },
  {
    field: "quantity",
    headerName: "Qty",
    width: 80,
    type: "number",
    editable: true,
  },
  {
    field: "unit_price",
    headerName: "Price",
    width: 110,
    type: "number",
    editable: true,
  },
  {
    field: "total_price",
    headerName: "Total",
    width: 120,
    type: "number",
    valueGetter: (value, row) => (row.quantity * row.unit_price).toFixed(2),
  },
  {
    field: "actions",
    headerName: "",
    width: 60,
    renderCell: (params) => (
      <IconButton
        color="error"
        size="small"
        onClick={() => onDelete(params.row.id)}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    ),
  },
];
