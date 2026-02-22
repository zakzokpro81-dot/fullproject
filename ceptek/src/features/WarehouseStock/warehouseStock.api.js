import supabase from "../../config/supabase";

export const WAREHOUSE_STOCK_QUERY_KEY = "warehouse_stock";

// ── Get All (server-side paginated + searchable) ──────────────────────────────
export async function getWarehouseStocks({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("warehouse_stock")
    .select(
      `id, quantity,
       products ( id, name, sku, brands ( id, name ) ),
       warehouses ( id, name )`,
      { count: "exact" }
    )
    .order("id", { ascending: true })
    .range(from, to);

  if (searchText) {
    query = query.or(
      `products.name.ilike.%${searchText}%,products.sku.ilike.%${searchText}%`,
      { foreignTable: "products" }
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

// ── Create (insert via stock_movements — DB trigger updates warehouse_stock) ──
export async function createWarehouseStock(payload) {
  const { data, error } = await supabase
    .from("stock_movements")
    .insert([{
      product_id: Number(payload.product_id),
      warehouse_id: Number(payload.warehouse_id),
      quantity: Number(payload.quantity),
      unit_cost: Number(payload.unit_cost ?? 0),
      movement_type_id: 1,
      reference_type: "Manual Entry",
      description: "Manual stock entry",
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Update (set quantity directly on warehouse_stock) ────────────────────────
export async function updateWarehouseStock(id, payload) {
  const updateData = { quantity: Number(payload.quantity) };
  if (payload.unit_cost !== undefined) {
    updateData.unit_cost = Number(payload.unit_cost);
  }

  const { data, error } = await supabase
    .from("warehouse_stock")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Delete (single) ───────────────────────────────────────────────────────────
export async function deleteWarehouseStock(id) {
  const { error } = await supabase
    .from("warehouse_stock")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

// ── Delete Multiple (bulk) ────────────────────────────────────────────────────
export async function deleteWarehouseStocks(ids) {
  const { error } = await supabase
    .from("warehouse_stock")
    .delete()
    .in("id", ids);

  if (error) throw error;
  return true;
}

// ── Reference data helpers (used by form dropdowns) ──────────────────────────
export async function getWarehouses() {
  const { data, error } = await supabase
    .from("warehouses")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}