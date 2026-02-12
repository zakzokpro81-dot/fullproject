import { IconButton, Stack, Checkbox } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const paymentColumns = (
  onEdit,
  onDelete,
  selectedIds,
  toggleSelect,
  rows = [],
  toggleSelectAll,
) => [
  {
    field: "selection",
    headerName: "",
    width: 50,
    renderHeader: () => (
      <Checkbox
        indeterminate={selectedIds.size > 0 && selectedIds.size < rows.length}
        checked={rows.length > 0 && selectedIds.size === rows.length}
        onChange={toggleSelectAll}
      />
    ),
    renderCell: (params) => (
      <Checkbox
        checked={params?.row ? selectedIds.has(params.row.id) : false}
        onChange={() => params?.row && toggleSelect(params.row.id)}
      />
    ),
  },
  { field: "date", headerName: "Date", width: 120 },
  {
    field: "invoice_info",
    headerName: "Invoice / Customer",
    flex: 1.5,
    // جلب رقم الفاتورة واسم الزبون المرتبط بها
    valueGetter: (params) => {
      const inv = params.row?.invoices;
      const custName = inv?.customers?.name || "Unknown";
      const invNum = inv?.invoice_number || `#${inv?.id}`;
      return `${invNum} - ${custName}`;
    },
  },
  { field: "amount", headerName: "Amount", width: 110, type: "number" },
  { field: "notes", headerName: "Notes", flex: 1.5 },
  {
    field: "actions",
    headerName: "Actions",
    width: 100,
    renderCell: (params) => (
      <Stack direction="row" spacing={0.5}>
        <IconButton
          color="primary"
          size="small"
          onClick={() => onEdit(params.row)}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="error"
          size="small"
          onClick={() => onDelete(params.row)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
    ),
  },
];
