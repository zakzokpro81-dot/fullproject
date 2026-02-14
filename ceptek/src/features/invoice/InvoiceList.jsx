import * as React from "react";
// استيراد المكونات من مكتبة MUI
import { Box, Button, Typography, Paper, Grid, Card, CardContent } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"; // أيقونة الصندوق
import { useQuery } from "@tanstack/react-query";

// استيراد الدوال والأعمدة الخاصة بالموديول
import { getInvoices, getDailySummary } from "./invoice.api"; // أضفنا دالة الملخص
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

  // جلب ملخص الجرد اليومي (الميزة الجديدة)
  const { data: summary } = useQuery({
    queryKey: ["dailySummary"],
    queryFn: getDailySummary,
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
      
      {/* قسم الجرد السريع (إضافة جديدة دون المساس بالأصل) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: "#e8f5e9", borderLeft: "5px solid #4caf50" }}>
            <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="caption" color="textSecondary">Daily Cash (Total Paid)</Typography>
             <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2e7d32" }}>
  ${Number(summary?.total_cash || 0).toFixed(2)}
</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: "#fff3e0", borderLeft: "5px solid #ff9800" }}>
            <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="caption" color="textSecondary">Daily Debt (Credit)</Typography>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ef6c00" }}>
  ${Number(summary?.total_credit || 0).toFixed(2)}
</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* رأس الصفحة الأصلي */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1a237e" }}>
          Invoices & Sales Archive 
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
          sx={{ borderRadius: 2, px: 3 }}
        >
          New Sale 
        </Button>
      </Box>

      {/* جدول البيانات الرئيسي الأصلي */}
      <Paper sx={{ height: 600, width: "100%", boxShadow: 3, borderRadius: 2 }}>
        <DataGrid
          rows={data || []}
          columns={invoiceColumns} // بقيت كما هي لضمان عدم حدوث أخطاء
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          disableRowSelectionOnClick
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