import supabase from "../../config/supabase";

// Table name
const TABLE_NAME = "product_categories";

// Query key constant for react-query
export const CATEGORY_QUERY_KEY = "categories";

// Get paginated categories with optional search
export async function getCategories({ page = 0, pageSize = 10, searchText = "" } = {}) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from(TABLE_NAME)
        .select("id,name,slug,is_active,show_all_models", { count: "exact" })
        .order("id", { ascending: false })
        .range(from, to);

    if (searchText) {
        const like = `%${searchText}%`;
        query = query.or(`name.ilike.${like},slug.ilike.${like}`);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
}

export async function createCategory(payload) {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateCategory(id, payload) {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(payload)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteCategory(id) {
    const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
    if (error) throw error;
    return true;
}

export async function deleteCategories(ids = []) {
    const { error } = await supabase.from(TABLE_NAME).delete().in("id", ids);
    if (error) throw error;
    return true;
}
