import supabase from "../../config/supabase";


export const getCustomerTypes = async ({ page, pageSize }) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("customer_types")
    .select("*", { count: "exact" })
    .order("id", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data, count };
};

export const createCustomerType = async (newType) => {
  const { data, error } = await supabase
    .from("customer_types")
    .insert([newType])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateCustomerType = async ({ id, ...updates }) => {
  const { data, error } = await supabase
    .from("customer_types")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteCustomerType = async (id) => {
  const { error } = await supabase
    .from("customer_types")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return id;
};