import supabase from "../../config/supabase";

export const getProductTypeAttributes = async () => {
    const { data, error } = await supabase
        .from("product_type_attributes")
        .select(`
      id,
      product_type_id,
      attribute_id,
      product_types ( id, name ),
      attributes ( id, name )
    `)
        .order("id", { ascending: true });

    if (error) throw error;
    return data;
};

export const createProductTypeAttribute = async (payload) => {
    const { data, error } = await supabase
        .from("product_type_attributes")
        .insert([payload])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateProductTypeAttribute = async ({ id, ...payload }) => {
    const { data, error } = await supabase
        .from("product_type_attributes")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteProductTypeAttribute = async (id) => {
    const { error } = await supabase
        .from("product_type_attributes")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return true;
};

/* ===== الدوال الناقصة التي يحتاجها الفورم ===== */

export const getProductTypes = async () => {
    const { data, error } = await supabase
        .from("product_types")
        .select("id, name")
        .order("name");

    if (error) throw error;
    return data;
};

export const getAttributes = async () => {
    const { data, error } = await supabase
        .from("attributes")
        .select("id, name")
        .order("name");

    if (error) throw error;
    return data;
};
