import supabase from "../../config/supabase";

export const getInvoices = async ({ page, pageSize, searchText }) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("invoices")
    .select(`
      *,
      customers (name, store_name),
      invoice_statuses (status_name)
    `, { count: "exact" })
    .order("id", { ascending: false })
    .range(from, to);

  if (searchText) {
    // البحث في اسم الزبون المرتبط
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