import  supabase  from "../../config/supabase";

// جلب كل المخازن
export const getWarehouses = async () => {
  const { data, error } = await supabase.from('warehouses').select('*').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

// إنشاء مخزن جديد
export const createWarehouse = async (warehouse) => {
  const { data, error } = await supabase.from('warehouses').insert([warehouse]).select().single();
  if (error) throw new Error(error.message);
  return data;
};

// تعديل مخزن
export const updateWarehouse = async (id, warehouse) => {
  const { data, error } = await supabase.from('warehouses').update(warehouse).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

// حذف مخزن
export const deleteWarehouse = async (id) => {
  const { error } = await supabase.from('warehouses').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
};
