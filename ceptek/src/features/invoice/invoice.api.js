import supabase from "../../config/supabase";

export const INVOICE_QUERY_KEY = "invoices";

// جلب قائمة الفواتير لعرضها في ملف الـ List
// export const getInvoices = async () => {
//   const { data, error } = await supabase
//     .from("invoices")
//     .select(`
//       *,
//       customers (name),
//       invoice_statuses (status_name)
//     `)
//     .order("invoice_date", { ascending: false });

//   if (error) throw error;
//   return data;
// };

// الدالة الأساسية لإتمام عملية البيع
// export const createInvoiceAction = async (payload) => {
//   // استدعاء الوظيفة التي أنشأناها في قاعدة البيانات (RPC)
//   const { data, error } = await supabase.rpc('process_sale', {
//     p_customer_id: payload.customer_id,
//     p_product_id: payload.product_id,
//     p_warehouse_id: payload.warehouse_id,
//     p_account_id: payload.account_id,
//     p_quantity: payload.quantity,
//     p_unit_price: payload.unit_price,
//     p_paid_amount: payload.paid_amount
//   });

//   if (error) throw error;
//   return data;
// };


// export const createInvoiceAction = async (payload) => {
//   // سنقوم بإرسال المنتجات واحداً تلو الآخر مؤقتاً للتأكد من أن الزر يعمل
//   // I will iterate through items and save them (Temporary logic until SQL is updated)
//   const promises = payload.items.map(item => {
//     return supabase.rpc('process_sale', {
//       p_customer_id: payload.customer_id,
//       p_warehouse_id: payload.warehouse_id,
//       p_account_id: payload.account_id,
//       p_product_id: item.product_id,
//       p_quantity: item.quantity,
//       p_unit_price: item.unit_price,
//       p_paid_amount: payload.paid_amount / payload.items.length // تقسيم الدفعة على الأصناف مؤقتاً
//     });
//   });

//   const results = await Promise.all(promises);
  
//   // التحقق من وجود أخطاء في أي عملية
//   const error = results.find(r => r.error);
//   if (error) throw error.error;

//   return results[0].data;
// };


export const createInvoiceAction = async (payload) => {
  const { data, error } = await supabase.rpc('process_bulk_sale', {
    p_customer_id: payload.customer_id,
    p_account_id: payload.account_id,
    p_warehouse_id: payload.warehouse_id, // هذا كان مفقوداً في استدعائك الأخير
    p_items: payload.items,
    p_paid_amount: payload.paid_amount
  });

  if (error) throw new Error(error.message);
  return data;
};


// 1. جلب الفواتير مع تفاصيل الصناديق والعملاء
export const getInvoicesWithDetails = async () => {
  const { data, error } = await supabase
    .from("invoice_with_details") // سنستخدم الـ View الذي أنشأناه
    .select("*")
    .order("invoice_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// 2. دالة الجرد اليومي (Summary)
export const getDailySummary = async () => {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("invoices")
    .select(`
      total_amount,
      paid_amount,
      invoice_date
    `)
    .gte("invoice_date", today); // جلب فواتير اليوم فقط

  if (error) throw new Error(error.message);

  // حساب الإجماليات برمجياً من البيانات المجلوبة
  const summary = data.reduce(
    (acc, inv) => {
      acc.total_cash += Number(inv.paid_amount || 0);
      acc.total_credit += Number(inv.total_amount || 0) - Number(inv.paid_amount || 0);
      return acc;
    },
    { total_cash: 0, total_credit: 0 }
  );

  return summary;
};


export const getInvoices = async () => {
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      customers ( name ),
      invoice_statuses ( status_name ),
      payments (
        accounts ( name )
      )
    `)
    .order("invoice_date", { ascending: false });

  if (error) throw new Error(error.message);



  return data.map((inv) => ({
  id: inv.id,
  total_amount: inv.total_amount,
  invoice_date: inv.invoice_date,
  customer_name: inv.customers?.name || "Cash Customer",
  status_name: inv.invoice_statuses?.status_name || "Unpaid",
  account_name: inv.payments?.[0]?.accounts?.name || "Credit Sale",
}));


};


export const getInvoiceDetails = async (invoiceId) => {
  const { data, error } = await supabase
    .from("invoice_items")
    .select(`
      id,
      quantity,
      unit_price,
      total_price,
      product:product_id ( 
        id, 
        name, 
        sku 
      )
    `)
    .eq("invoice_id", invoiceId);

  if (error) {
    console.error("Error fetching invoice items:", error);
    throw error;
  }

  // معالجة البيانات لضمان أن المنتج كائن وليس مصفوفة
  return data.map((item) => ({
    ...item,
    // بما أن product_id هو Foreign Key لـ products، Supabase قد يرجعه ككائن أو مصفوفة
    product: Array.isArray(item.product) ? item.product[0] : item.product
  }));
};
