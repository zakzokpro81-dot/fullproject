import supabase from "../../config/supabase";

export const CUSTOMER_QUERY_KEY = "customers";

// جلب الزبائن مع دعم الصفحات والبحث والفلترة
export const getCustomers = async ({ page, pageSize, searchText, customerTypeId }) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("customers")
    // طلب جلب بيانات الجدول المرتبط type_name من جدول customer_types
    .select("*, customer_types(type_name)", { count: "exact" })
    .order("id", { ascending: false })
    .range(from, to);

  if (searchText) {
    query = query.or(`name.ilike.%${searchText}%,store_name.ilike.%${searchText}%`);
  }

  if (customerTypeId) {
    query = query.eq("customer_type_id", customerTypeId);
  }

  const { data, count, error } = await query;
  if (error) throw error;
  
  // سطر للفحص البرمجي (اختياري)
  console.log("Full Row Sample:", data?.[0]); 
  
  return { data, count };
};
// إضافة زبون جديد
export const createCustomer = async (newCustomer) => {
  const { data, error } = await supabase
    .from("customers")
    .insert([newCustomer])
    .select();
  if (error) throw error;
  return data[0];
};

// تعديل بيانات زبون
export const updateCustomer = async ({ id, ...updates }) => {
  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data[0];
};

// حذف زبون واحد
export const deleteCustomer = async (id) => {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return id;
};

// --- الدالة المفقودة: الحذف الجماعي ---
export const deleteCustomers = async (ids) => {
  const { error } = await supabase
    .from("customers")
    .delete()
    .in("id", ids); // استخدام عامل التصفية 'in' لحذف مجموعة معرفات
  if (error) throw error;
  return ids;
};