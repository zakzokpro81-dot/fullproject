import { Chip, Stack, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export  const invoicesColumns = (onEdit, onDelete) => [
  { field: "id", headerName: "ID", width: 70 },
  {
    field: "customer_name",
    headerName: "Customer",
    flex: 1.5,
    // الوصول للاسم من خلال الكائن الذي يجلبه الـ API
    valueGetter: (value, row) => row?.customers?.name || "N/A",
  },
  {
    field: "invoice_date", // تأكد أن هذا الاسم يطابق العمود في قاعدة البيانات
    headerName: "Date",
    width: 150,
    renderCell: (params) => {
      // نستخدم params.row.invoice_date مباشرة لضمان القراءة
      const dateVal = params.row?.invoice_date;
      return dateVal ? new Date(dateVal).toLocaleDateString() : "N/A";
    },
  },
  { field: "total_amount", headerName: "Total", width: 110, type: "number" },
  { field: "paid_amount", headerName: "Paid", width: 110, type: "number" },
  {
    field: "status_name",
    headerName: "Status",
    width: 120,
    valueGetter: (value, row) => row?.invoice_statuses?.status_name || "N/A",
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        color="primary"
        variant="outlined"
      />
    ),
  },
  // ... باقي أعمدة الأزرار (Actions) كما هي لديك
];
