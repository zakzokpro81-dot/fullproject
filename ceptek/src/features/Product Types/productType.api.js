import supabase from "../../config/supabase";

export const PRODUCTTYPE_QUERY_KEY = "productTypes";

const TABLE_NAME = "product_types";

export async function getProductTypes({
  page = 0,
  pageSize = 10,
  searchText = "",
  filters = {},
} = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE_NAME)
    .select(`
      id, name, slug, is_active, category_id, variant_strategy_id, tracking_type_id,
      product_categories (id, name),
      variant_strategies (id, name),
      tracking_types (id, name)
    `, { count: "exact" })
    .order("name", { ascending: true })
    .range(from, to);

  if (searchText) {
    query = query.or(
      `name.ilike.%${searchText}%,slug.ilike.%${searchText}%`
    );
  }

  // Apply filters
  if (filters.tracking_type_id) {
    query = query.eq("tracking_type_id", filters.tracking_type_id);
  }
  if (filters.variant_strategy_id) {
    query = query.eq("variant_strategy_id", filters.variant_strategy_id);
  }
  if (filters.category_id) {
    query = query.eq("category_id", filters.category_id);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createProductType(payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProductType(id, payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProductType(id) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

export async function deleteProductTypes(ids) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .in("id", ids);

  if (error) throw error;
  return true;
}

// These functions are for populating form dropdowns and can be fetched once.
export const getTrackingTypes = async () => {
  const { data, error } = await supabase
    .from("tracking_types")
    .select("id, name")
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
};

export const getVariantStrategiesFromDB = async () => {
  const { data, error } = await supabase
    .from("variant_strategies")
    .select("id, name, code")
    .order("id");

  if (error) throw error;
  return data;
};



