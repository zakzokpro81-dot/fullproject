import supabase from "../../config/supabase";

/**
 * Get customers with pagination, search and filters (server-side)
 */
export async function getCustomers({
    page = 0,
    pageSize = 10,
    searchText = "",
    customerTypeId = "",
}) {
    let query = supabase
        .from("customers")
        .select(
            `
      id,
      name,
      store_name,
      email,
      phone,
      address,
      is_active,
      created_at,
      customer_type_id,
      customer_types(type_name)
    `,
            { count: "exact" }
        )
        .order("id", { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);

    if (searchText) {
        query = query.or(
            `name.ilike.%${searchText}%,store_name.ilike.%${searchText}%,phone.ilike.%${searchText}%,email.ilike.%${searchText}%`
        );
    }

    if (customerTypeId) {
        query = query.eq("customer_type_id", customerTypeId);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
        data,
        count,
    };
}

/**
 * Create new customer
 */
export async function createCustomer(payload) {
    const { error } = await supabase.from("customers").insert(payload);
    if (error) throw error;
}

/**
 * Update customer
 */
export async function updateCustomer(id, payload) {
    const { error } = await supabase
        .from("customers")
        .update(payload)
        .eq("id", id);
    if (error) throw error;
}

/**
 * Delete single customer
 */
export async function deleteCustomer(id) {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) throw error;
}

/**
 * Delete multiple customers
 */
export async function deleteCustomers(ids = []) {
    if (!ids.length) return;

    const { error } = await supabase.from("customers").delete().in("id", ids);
    if (error) throw error;
}

/**
 * Get customer types (for filters & form)
 */
export async function getCustomerTypes() {
    const { data, error } = await supabase
        .from("customer_types")
        .select("id, type_name")
        .order("type_name");

    if (error) throw error;
    return data;
}
