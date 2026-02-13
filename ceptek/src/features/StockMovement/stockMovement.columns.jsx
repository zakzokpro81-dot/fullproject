import { Chip } from "@mui/material";

export const stockMovementColumns = [
  // { field: "id", headerName: "ID", width: 70 },
  { 
    field: "product_name", 
    headerName: "Product", 
    flex: 1.5,
    valueGetter: (value, row) => row?.products?.name || "N/A" 
  },
  { 
    field: "sku", 
    headerName: "SKU", 
    width: 120,
    // تم التعديل هنا ليقرأ من حقل sku داخل جدول products
    valueGetter: (value, row) => row?.products?.sku || "N/A" 
  },
  {
    field: "quantity",
    headerName: "Qty",
    width: 100,
    renderCell: (params) => (
      <span style={{ color: params.value > 0 ? "green" : "red", fontWeight: "bold" }}>
        {params.value > 0 ? `+${params.value}` : params.value}
      </span>
    )
  },
  { 
    field: "warehouse", 
    headerName: "Warehouse", 
    width: 150,
    valueGetter: (value, row) => row?.warehouses?.name || "N/A" 
  },
  {
    field: "movement_type",
    headerName: "Type",
    width: 150,
    valueGetter: (value, row) => row?.stock_movement_types?.movement_name || "N/A",
    renderCell: (params) => (
      <Chip label={params.value} size="small" variant="outlined" color="info" />
    )
  },
  { 
    field: "created_at", 
    headerName: "Date", 
    width: 180,
    // تحسين معالجة التاريخ لضمان عدم ظهور Invalid Date
    valueGetter: (value, row) => {
      if (!row.created_at) return "N/A";
      const date = new Date(row.created_at);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
    }
  },
  { 
  field: "reference", 
  headerName: "Reference", 
  width: 150,
  // سنقوم بدمج النوع مع الـ ID ليعطي شكلاً احترافياً
  valueGetter: (value, row) => {
    const type = row?.reference_type || "";
    const id = row?.reference_id || "";
    return type ? `${type} #${id}` : "N/A";
  }
}
];