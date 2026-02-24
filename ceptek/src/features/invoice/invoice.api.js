import supabase from "../../config/supabase";

export const INVOICE_QUERY_KEY = "invoices";

export async function createInvoiceAction(payload) {
  const { data, error } = await supabase.rpc("process_bulk_sale", {
    p_customer_id: payload.customer_id,
    p_account_id: payload.account_id,
    p_warehouse_id: payload.warehouse_id,
    p_items: payload.items,
    p_paid_amount: payload.paid_amount,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function getInvoicesWithDetails() {
  const { data, error } = await supabase
    .from("invoice_with_details")
    .select("*")
    .order("invoice_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getDailySummary() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("invoices")
    .select("total_amount, paid_amount, invoice_date")
    .gte("invoice_date", today);

  if (error) throw new Error(error.message);

  const summary = data.reduce(
    (acc, inv) => {
      acc.total_cash += Number(inv.paid_amount || 0);
      acc.total_credit +=
        Number(inv.total_amount || 0) - Number(inv.paid_amount || 0);
      return acc;
    },
    { total_cash: 0, total_credit: 0 },
  );

  return summary;
}

export async function getInvoices() {
  const { data, error } = await supabase
    .from("invoices")
    .select(
      `id, total_amount, paid_amount, invoice_date,
       customers ( name ),
       invoice_statuses ( status_name ),
       payments ( accounts ( name ) )`,
    )
    .order("invoice_date", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((inv) => ({
    id: inv.id,
    total_amount: inv.total_amount,
    paid_amount: inv.paid_amount,
    invoice_date: inv.invoice_date,
    customer_name: inv.customers?.name || "Cash Customer",
    status_name: inv.invoice_statuses?.status_name || "Unpaid",
    account_name: inv.payments?.[0]?.accounts?.name || "Credit Sale",
  }));
}

export async function getInvoiceDetails(invoiceId) {
  const { data, error } = await supabase
    .from("invoice_items")
    .select(
      `id, quantity, unit_price, total_price,
       product:product_id ( id, name, sku )`,
    )
    .eq("invoice_id", invoiceId);

  if (error) throw error;

  return data.map((item) => ({
    ...item,
    product: Array.isArray(item.product) ? item.product[0] : item.product,
  }));
}

export async function getInvoiceFormData(warehouseId) {
  const [customersRes, warehousesRes, accountsRes] = await Promise.all([
    supabase.from("customers").select("id, name"),
    supabase.from("warehouses").select("id, name"),
    supabase.from("accounts").select("id, name, balance"),
  ]);

  if (customersRes.error) throw customersRes.error;
  if (warehousesRes.error) throw warehousesRes.error;
  if (accountsRes.error) throw accountsRes.error;

  return {
    customers: customersRes.data,
    warehouses: warehousesRes.data,
    accounts: accountsRes.data,
  };
}

export async function getProductsForInvoice(warehouseId) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, sku, sell_price,
       warehouse_stock!inner ( quantity )`,
    )
    .eq("is_active", true)
    .eq("warehouse_stock.warehouse_id", warehouseId);

  if (error) throw error;
  return data;
}
