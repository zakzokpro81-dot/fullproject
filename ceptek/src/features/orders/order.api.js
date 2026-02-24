import supabase from "../../config/supabase";

export const ORDER_QUERY_KEY = "orders";

export async function getOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_date,
      notes,
      customer_id,
      status_id,
      warehouse_id,
      customers ( name ),
      order_statuses ( status_name ),
      warehouses ( name ),
      order_items (
        quantity,
        notes,
        product_variant_id,
        products:product_variant_id ( id, name, sku )
      )
    `)
    .order("order_date", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((order) => {
    const warehouseObj = order.warehouses;
    const warehouseName = Array.isArray(warehouseObj)
      ? warehouseObj[0]?.name
      : warehouseObj?.name;

    return {
      ...order,
      display_date: order.order_date
        ? new Date(order.order_date).toLocaleDateString()
        : "No Date",
      status_display: order.order_statuses?.status_name || "Pending",
      customer_name: order.customers?.name || "Unknown Customer",
      warehouse_name: warehouseName || "Not Assigned",
      raw_items: order.order_items || [],
    };
  });
}

export async function createOrderAction(payload) {
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: payload.customer_id,
      warehouse_id: payload.warehouse_id,
      status_id: payload.status_id || 1,
      notes: payload.notes,
    })
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);

  const itemsToInsert = payload.items.map((item) => ({
    order_id: orderData.id,
    product_variant_id: item.product_id,
    quantity: item.quantity,
    notes: item.notes,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsToInsert);

  if (itemsError) throw new Error(itemsError.message);

  return orderData;
}

export async function getProductDetails(productId) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, name, sku, sell_price, stock, description, is_active,
      product_types ( name ),
      product_categories ( name ),
      brands ( name ),
      product_attribute_values ( value, attributes ( name ) ),
      warehouse_stock ( quantity, warehouses:warehouse_id ( name ) )
    `)
    .eq("id", productId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function confirmAndShipOrder(orderId, warehouseId, items) {
  for (const item of items) {
    const { data: stockData, error: fetchError } = await supabase
      .from("warehouse_stock")
      .select("quantity, products(name)")
      .eq("warehouse_id", warehouseId)
      .eq("product_id", item.product_variant_id)
      .single();

    if (fetchError || !stockData) {
      throw new Error("Product not found in this warehouse.");
    }

    if (stockData.quantity < item.quantity) {
      throw new Error(
        `Cannot ship! Available stock for "${stockData.products.name}" is (${stockData.quantity}) while the order requires (${item.quantity}).`
      );
    }
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status_id: 2 })
    .eq("id", orderId);

  if (updateError) throw new Error(updateError.message);

  for (const item of items) {
    const { data: stockData } = await supabase
      .from("warehouse_stock")
      .select("quantity")
      .eq("warehouse_id", warehouseId)
      .eq("product_id", item.product_variant_id)
      .single();

    const newQuantity = stockData.quantity - item.quantity;

    const { error: stockUpdateError } = await supabase
      .from("warehouse_stock")
      .update({ quantity: newQuantity })
      .eq("warehouse_id", warehouseId)
      .eq("product_id", item.product_variant_id);

    if (stockUpdateError) throw new Error(stockUpdateError.message);
  }

  return { success: true };
}

export async function getOrderFormData() {
  const [customersRes, warehousesRes] = await Promise.all([
    supabase.from("customers").select("id, name").order("name"),
    supabase.from("warehouses").select("id, name").order("name"),
  ]);

  if (customersRes.error) throw new Error(customersRes.error.message);
  if (warehousesRes.error) throw new Error(warehousesRes.error.message);

  return {
    customers: customersRes.data,
    warehouses: warehousesRes.data,
  };
}

export async function getProductsForOrder(warehouseId) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, name, sku,
      warehouse_stock!inner ( warehouse_id, quantity )
    `)
    .eq("is_active", true)
    .eq("warehouse_stock.warehouse_id", warehouseId)
    .gt("warehouse_stock.quantity", 0);

  if (error) throw new Error(error.message);
  return data;
}