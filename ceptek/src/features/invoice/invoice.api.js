import supabase from "../../config/supabase";

// جلب قائمة الفواتير لعرضها في ملف الـ List
export const getInvoices = async () => {
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      customers (name),
      invoice_statuses (status_name)
    `)
    .order("invoice_date", { ascending: false });

  if (error) throw error;
  return data;
};

// الدالة الأساسية لإتمام عملية البيع
export const createInvoiceAction = async (payload) => {
  // استدعاء الوظيفة التي أنشأناها في قاعدة البيانات (RPC)
  const { data, error } = await supabase.rpc('process_sale', {
    p_customer_id: payload.customer_id,
    p_product_id: payload.product_id,
    p_warehouse_id: payload.warehouse_id,
    p_account_id: payload.account_id,
    p_quantity: payload.quantity,
    p_unit_price: payload.unit_price,
    p_paid_amount: payload.paid_amount
  });

  if (error) throw error;
  return data;
};