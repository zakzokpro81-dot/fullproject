import supabase from "../../config/supabase";

const TABLE_NAME = "purchase_orders";
export const SUPPLIER_FINISHED_ORDER_QUERY_KEY = "supplierFinishedOrders";

export async function getSupplierFinishedOrders({
  page = 0,
  pageSize = 10,
  searchText = "",
  supplierId,
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
       supplier_id,
       status_id,
       warehouse_id,
       total_amount,
       suppliers:suppliers!purchase_orders_supplier_id_fkey ( id, name ),
       order_statuses:order_statuses!purchase_orders_status_id_fkey ( id, status_name ),
       warehouses:warehouses!purchase_orders_warehouse_id_fkey ( id, name ),
       purchase_order_items (
         id,
         quantity,
         unit_cost,
         total_cost,
         product_id,
         products:product_id ( id, name, sku )
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

  if (supplierId) {
    query = query.eq("supplier_id", supplierId);
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

    const supplierObj = order.suppliers;
    const supplierName = Array.isArray(supplierObj)
      ? supplierObj[0]?.name
      : supplierObj?.name;

    const statusObj = order.order_statuses;
    const statusName = Array.isArray(statusObj)
      ? statusObj[0]?.status_name
      : statusObj?.status_name;

    const items = order.purchase_order_items || [];
    const totalItems = items.reduce((sum, i) => sum + (i.quantity || 0), 0);

    return {
      ...order,
      display_date: order.order_date
        ? new Date(order.order_date).toLocaleDateString()
        : "No Date",
      status_display: statusName || "Confirmed",
      supplier_name: supplierName || "Unknown Supplier",
      warehouse_name: warehouseName || "Not Assigned",
      total_items: totalItems,
      raw_items: items,
    };
  });

  return { data: rows, count };
}

export async function getSupplierFinishedOrderFilterData() {
  const [suppliersRes, warehousesRes] = await Promise.all([
    supabase.from("suppliers").select("id, name").order("name"),
    supabase.from("warehouses").select("id, name").order("name"),
  ]);

  if (suppliersRes.error) throw new Error(suppliersRes.error.message);
  if (warehousesRes.error) throw new Error(warehousesRes.error.message);

  return {
    suppliers: suppliersRes.data || [],
    warehouses: warehousesRes.data || [],
  };
}
