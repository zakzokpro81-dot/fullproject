import supabase from "../../config/supabase";

const TABLE_NAME = "product_type_attributes";
export const PTA_QUERY_KEY = "product_type_attributes";

export async function getProductTypeAttributes() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(
      `id, product_type_id, attribute_id,
       product_types ( id, name ),
       attributes ( id, name )`,
    )
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createProductTypeAttribute(payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProductTypeAttribute(id, payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProductTypeAttribute(id) {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteProductTypeAttributes(ids) {
  const { error } = await supabase.from(TABLE_NAME).delete().in("id", ids);
  if (error) throw error;
  return true;
}

export async function getProductTypes() {
  const { data, error } = await supabase
    .from("product_types")
    .select("id, name")
    .order("name");
  if (error) throw error;
  return data;
}

export async function getAttributes() {
  const { data, error } = await supabase
    .from("attributes")
    .select("id, name")
    .order("name");
  if (error) throw error;
  return data;
}
