import supabase from "../../config/supabase";

// Get all attribute options with related attribute name
export async function getAttributeOptions() {
    const { data, error } = await supabase
        .from("attribute_options")
        .select("*, attributes(id, name, data_type, is_active)")
        .order("id", { ascending: false });

    if (error) throw error;
    return data;
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

export async function updateAttributeOption({ id, ...payload }) {
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