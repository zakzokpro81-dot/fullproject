import supabase from "../../config/supabase";

const TABLE_NAME = "stock_movements";
export const STOCK_MOVEMENT_QUERY_KEY = "stockMovements";

export async function getStockMovements({ page, pageSize, searchText }) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE_NAME)
    .select(
      `id, product_id, warehouse_id, movement_type_id, quantity, unit_cost,
       reference_id, reference_type, created_at, description,
       products ( name, sku ),
       warehouses ( name ),
       stock_movement_types ( movement_name )`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchText) {
    query = query.ilike("products.name", `%${searchText}%`);
  }

  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getMovementTypes() {
  const { data, error } = await supabase
    .from("stock_movement_types")
    .select("id, movement_name");
  if (error) throw error;
  return data;
}

export async function getWarehouses() {
  const { data, error } = await supabase
    .from("warehouses")
    .select("id, name");
  if (error) throw error;
  return data;
}

export async function getProductsForMovement() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku, status, stock")
    .neq("status", "inactive")
    .order("name");
  if (error) throw error;
  return data;
}

export async function createStockMovement(payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      product_id: payload.product_id,
      warehouse_id: payload.warehouse_id,
      quantity: payload.quantity,
      unit_cost: payload.unit_cost || 0,
      movement_type_id: payload.movement_type_id,
      reference_type: payload.reference_type || "Manual",
      product_variant_id: null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}