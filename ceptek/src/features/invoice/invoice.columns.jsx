import { Chip, Stack, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const invoiceColumns = (onEdit, onDelete) => [
  {
    field: "id",
    headerName: "Inv ID",
    width: 90,
  },
  {
    field: "customer_name",
    headerName: "Customer",
    flex: 1.5,
    // الحماية هنا باستخدام params?.row
    valueGetter: (params) => params?.row?.customers?.name || "N/A",
  },
  {
    field: "invoice_date",
    headerName: "Date",
    width: 160,
    valueFormatter: (params) =>
      params?.value ? new Date(params.value).toLocaleDateString() : "",
  },
  {
    field: "total_amount",
    headerName: "Total",
    width: 110,
    type: "number",
  },
  {
    field: "paid_amount",
    headerName: "Paid",
    width: 110,
    type: "number",
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => (
      <Chip
        label={params?.row?.invoice_statuses?.status_name || "Unknown"}
        variant="outlined"
        color="primary"
        size="small"
      />
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 110,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton
          color="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            if (params?.row) onEdit(params.row);
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="error"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            if (params?.row) onDelete(params.row);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    ),
  },
];
