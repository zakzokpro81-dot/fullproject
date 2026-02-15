import supabase from "../../config/supabase";




export const getInvoices = async ({ page, pageSize, searchText }) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  // الربط هنا يعتمد على أن "customers" هو اسم الجدول المرتبط بـ "customer_id"
  let query = supabase
    .from("invoices")
    .select(`
      id,
      invoice_date,
      total_amount,
      paid_amount,
      status_id,
      customers (
        name
      ),
      invoice_statuses (
        status_name
      )
    `, { count: "exact" })
    .order("id", { ascending: false })
    .range(from, to);

  if (searchText) {
    // البحث في اسم العميل داخل الجدول المرتبط
    query = query.ilike("customers.name", `%${searchText}%`);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return { data, count };
};


export const createInvoice = async (newInvoice) => {
  const { data, error } = await supabase.from("invoices").insert([newInvoice]).select();
  if (error) throw error;
  return data[0];
};

export const updateInvoice = async ({ id, ...updates }) => {
  const { data, error } = await supabase.from("invoices").update(updates).eq("id", id).select();
  if (error) throw error;
  return data[0];
};

export const deleteInvoice = async (id) => {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw error;
  return id;
};

// دالة لجلب الحالات لاستخدامها في القائمة المنسدلة
export const getInvoiceStatuses = async () => {
  const { data, error } = await supabase.from("invoice_statuses").select("*");
  if (error) throw error;
  return data;
};