import supabase from "../../config/supabase";

const TABLE_NAME = "stock_movements";
export const STOCK_TRANSACTION_LOG_QUERY_KEY = "stockTransactionLog";

export async function getStockTransactionLogs({
  page = 0,
  pageSize = 10,
  searchText = "",
  movementTypeId,
  warehouseId,
  dateFrom,
  dateTo,
} = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE_NAME)
    .select(
      `id, quantity, unit_cost, reference_type, description, created_at,
       product_id, warehouse_id, movement_type_id,
       products ( id, name, sku ),
       warehouses ( id, name ),
       stock_movement_types ( id, movement_name )`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchText) {
    const like = `%${searchText}%`;
    query = query.or(`reference_type.ilike.${like},description.ilike.${like}`);
  }

  if (movementTypeId) {
    query = query.eq("movement_type_id", movementTypeId);
  }

  if (warehouseId) {
    query = query.eq("warehouse_id", warehouseId);
  }

  if (dateFrom) {
    query = query.gte("created_at", dateFrom);
  }

  if (dateTo) {
    query = query.lte("created_at", `${dateTo}T23:59:59`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const rows = (data || []).map((row) => ({
    ...row,
    display_date: row.created_at
      ? new Date(row.created_at).toLocaleDateString()
      : "—",
    product_name: row.products?.name || "Unknown Product",
    product_sku: row.products?.sku || "",
    warehouse_name: row.warehouses?.name || "Unknown Warehouse",
    movement_type_name: row.stock_movement_types?.movement_name || "Unknown",
  }));

  return { data: rows, count };
}

export async function getStockTransactionLogFilterData() {
  const [movTypesRes, warehousesRes] = await Promise.all([
    supabase.from("stock_movement_types").select("id, movement_name").order("movement_name"),
    supabase.from("warehouses").select("id, name").order("name"),
  ]);

  if (movTypesRes.error) throw new Error(movTypesRes.error.message);
  if (warehousesRes.error) throw new Error(warehousesRes.error.message);

  return {
    movementTypes: movTypesRes.data || [],
    warehouses: warehousesRes.data || [],
  };
}
