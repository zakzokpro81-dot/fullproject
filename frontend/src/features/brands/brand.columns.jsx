// 3️⃣ brand.columns.js

// 📌 تعريف أعمدة جدول العرض

// اسم العمود

// العنوان

// هل فيه Actions؟

// هل فيه Toggle؟

// الهدف:
// نفس الجدول ممكن نستخدمه لاحقاً مع DataGrid أو Table ثانية بدون تعديل المنطق



export const brandColumns = (onEdit, onDelete) => [
  {
    field: "name",
    headerName: "Brand Name",
    flex: 1,
  },
  {
    field: "slug",
    headerName: "Slug",
    flex: 1,
  },
  {
    field: "is_active",
    headerName: "Status",
    width: 120,
    renderCell: (params) =>
      params.value ? "Active" : "Inactive",
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 160,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const row = params.row;

      return (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onEdit(row)}>Edit</button>
          <button onClick={() => onDelete(row.id)}>Delete</button>
        </div>
      );
    },
  },
];
