import supabase from "../../config/supabase";

const TABLE_NAME = "orders";
export const CUSTOMER_FINISHED_ORDER_QUERY_KEY = "customerFinishedOrders";

export async function getCustomerFinishedOrders({
  page = 0,
  pageSize = 10,
  searchText = "",
  customerId,
  warehouseId,
  dateFrom,
  dateTo,
} = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE_NAME)
    .select(
      `id,
       order_date,
       notes,
       customer_id,
       status_id,
       warehouse_id,
       customers ( id, name ),
       order_statuses ( status_name ),
       warehouses ( name ),
       order_items (
         id,
         quantity,
         notes,
         product_variant_id,
         products:product_variant_id ( id, name, sku, sell_price )
       )`,
      { count: "exact" },
    )
    .eq("status_id", 2)
    .order("order_date", { ascending: false })
    .range(from, to);

  if (searchText) {
    const like = `%${searchText}%`;
    query = query.or(`notes.ilike.${like}`);
  }

  if (customerId) {
    query = query.eq("customer_id", customerId);
  }

  if (warehouseId) {
    query = query.eq("warehouse_id", warehouseId);
  }

  if (dateFrom) {
    query = query.gte("order_date", dateFrom);
  }

  if (dateTo) {
    query = query.lte("order_date", dateTo);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const rows = (data || []).map((order) => {
    const warehouseObj = order.warehouses;
    const warehouseName = Array.isArray(warehouseObj)
      ? warehouseObj[0]?.name
      : warehouseObj?.name;

    const items = order.order_items || [];
    const totalItems = items.reduce((sum, i) => sum + (i.quantity || 0), 0);

    return {
      ...order,
      display_date: order.order_date
        ? new Date(order.order_date).toLocaleDateString()
        : "No Date",
      status_display: order.order_statuses?.status_name || "Confirmed",
      customer_name: order.customers?.name || "Unknown Customer",
      warehouse_name: warehouseName || "Not Assigned",
      total_items: totalItems,
      raw_items: items,
    };
  });

  return { data: rows, count };
}

export async function getFinishedOrderFilterData() {
  const [customersRes, warehousesRes] = await Promise.all([
    supabase.from("customers").select("id, name").order("name"),
    supabase.from("warehouses").select("id, name").order("name"),
  ]);

  if (customersRes.error) throw new Error(customersRes.error.message);
  if (warehousesRes.error) throw new Error(warehousesRes.error.message);

  return {
    customers: customersRes.data || [],
    warehouses: warehousesRes.data || [],
  };
}
