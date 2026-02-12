import supabase from "../../config/supabase";


export const getCustomerTypes = async ({
  page,
  pageSize,
  searchText,
}) => {
  let query = supabase
    .from("customer_types")
    .select("*", { count: "exact" });

  if (searchText) {
    query = query.ilike("type_name", `%${searchText}%`);
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return { data, count };
};

export const deleteCustomerType = async (id) => {
  const { error } = await supabase
    .from("customer_types")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const deleteCustomerTypes = async (ids) => {
  const { error } = await supabase
    .from("customer_types")
    .delete()
    .in("id", ids);

  if (error) throw error;
};
