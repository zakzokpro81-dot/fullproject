import supabase from "../../config/supabase";

export const PURCHASE_ORDER_QUERY_KEY = "purchase_orders";

export async function getPurchaseOrders({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("purchase_orders")
    .select(
      `id, supplier_id, warehouse_id, order_date, total_amount, notes,
       status_id, created_by, created_at,
       suppliers:suppliers!purchase_orders_supplier_id_fkey ( id, name ),
       warehouses:warehouses!purchase_orders_warehouse_id_fkey ( id, name ),
       order_statuses:order_statuses!purchase_orders_status_id_fkey ( id, status_name )`,
      { count: "exact" }
    )
    .order("id", { ascending: false })
    .range(from, to);

  if (searchText) {
    query = query.or(`notes.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createPurchaseOrder(payload) {
  const { data, error } = await supabase.from("purchase_orders").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updatePurchaseOrder(id, payload) {
  const { data, error } = await supabase.from("purchase_orders").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deletePurchaseOrder(id) {
  const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deletePurchaseOrders(ids) {
  const { error } = await supabase.from("purchase_orders").delete().in("id", ids);
  if (error) throw error;
  return true;
}
