import * as React from "react";
// استيراد المكونات من مكتبة MUI
import { Box, Button, Typography, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { useQuery } from "@tanstack/react-query";

// استيراد الدوال والأعمدة الخاصة بالموديول
import { getInvoices } from "./invoice.api";
import { invoiceColumns } from "./invoice.columns";
import InvoiceForm from "./InvoiceForm";

export function InvoiceList() {
  // حالة التحكم في فتح وإغلاق نافذة البيع (الـ POS)
  const [openForm, setOpenForm] = React.useState(false);

  // جلب بيانات الفواتير باستخدام React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });

  // معالجة حالة الخطأ في جلب البيانات
  if (isError) {
    return (
      <Typography color="error">
        Error loading invoices: {error.message}
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* رأس الصفحة: العنوان وزر الإضافة */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1a237e" }}>
          Invoices & Sales Archive (سجل المبيعات)
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
          sx={{ borderRadius: 2, px: 3 }}
        >
          New Sale (عملية بيع جديدة)
        </Button>
      </Box>

      {/* جدول البيانات الرئيسي */}
      <Paper sx={{ height: 600, width: "100%", boxShadow: 3, borderRadius: 2 }}>
        <DataGrid
          rows={data || []}
          columns={invoiceColumns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          // تحسين تجربة المستخدم: منع اختيار الصف عند الضغط على الخلايا
          disableRowSelectionOnClick
          // تنسيق إضافي للجدول
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
            },
          }}
        />
      </Paper>

      {/* استدعاء الفورم (نافذة البيع) */}
      <InvoiceForm open={openForm} onClose={() => setOpenForm(false)} />
    </Box>
  );
}
