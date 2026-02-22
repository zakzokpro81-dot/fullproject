import supabase from "../../config/supabase";

export const ATTRIBUTE_OPTION_QUERY_KEY = "attribute_options";

// Get all attribute options with related attribute name, paginated and searchable
export async function getAttributeOptions({ page = 0, pageSize = 10, searchText = "", attributeId = "" } = {}) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from("attribute_options")
        .select("id, attribute_id, value, slug, attributes(id, name, data_type, is_active)", { count: "exact" })
        .order("id", { ascending: false })
        .range(from, to);

    if (attributeId) {
        query = query.eq("attribute_id", attributeId);
    }

    if (searchText) {
        query = query.or(`value.ilike.%${searchText}%,slug.ilike.%${searchText}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
}

export async function createAttributeOption(payload) {
    const { data, error } = await supabase
        .from("attribute_options")
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateAttributeOption(id, payload) {
    const { data, error } = await supabase
        .from("attribute_options")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteAttributeOption(id) {
    const { error } = await supabase
        .from("attribute_options")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return true;
}

export async function deleteAttributeOptions(ids) {
    const { error } = await supabase
        .from("attribute_options")
        .delete()
        .in("id", ids);

    if (error) throw error;
    return true;
}

export async function getAttributes() {
    const { data, error } = await supabase
        .from("attributes")
        .select("id, name, data_type, has_options, is_active")
        .eq("has_options", true)
        .eq("is_active", true)
        .order("id", { ascending: false });

    if (error) throw error;
    return data;
}