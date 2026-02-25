import supabase from "../../config/supabase";

export const PURCHASE_INVOICE_QUERY_KEY = "purchase_invoices";

export async function getPurchaseInvoices({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("purchase_invoices")
    .select(
      `id, supplier_id, purchase_order_id, invoice_date, total_amount,
       paid_amount, status_id, invoice_number, notes, created_by, created_at,
       suppliers:suppliers!purchase_invoices_supplier_id_fkey ( id, name ),
       invoice_statuses:invoice_statuses!purchase_invoices_status_id_fkey ( id, status_name )`,
      { count: "exact" }
    )
    .order("id", { ascending: false })
    .range(from, to);

  if (searchText) {
    query = query.or(`invoice_number.ilike.%${searchText}%,notes.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getPurchaseInvoiceItems(invoiceId) {
  const { data, error } = await supabase
    .from("purchase_invoice_items")
    .select(
      `id, product_id, quantity, unit_cost, total_cost,
       products:products!purchase_invoice_items_product_id_fkey ( id, name, sku )`
    )
    .eq("purchase_invoice_id", invoiceId)
    .order("id");

  if (error) throw error;
  return data;
}

export async function getProductsForPurchase() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku, cost_price")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
}

export async function createPurchaseInvoice(payload) {
  const { items, ...header } = payload;

  // Create the invoice header
  const { data: invoice, error: invError } = await supabase
    .from("purchase_invoices")
    .insert(header)
    .select()
    .single();
  if (invError) throw invError;

  // Create items if provided
  if (items && items.length > 0) {
    const preparedItems = items.map((item) => ({
      purchase_invoice_id: invoice.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
      total_cost: item.quantity * item.unit_cost,
    }));

    const { error: itemsError } = await supabase
      .from("purchase_invoice_items")
      .insert(preparedItems);
    if (itemsError) throw itemsError;
  }

  return invoice;
}

export async function updatePurchaseInvoice(id, payload) {
  const { items, ...header } = payload;

  // Update header
  const { data, error } = await supabase
    .from("purchase_invoices")
    .update(header)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  // Replace items: delete old ones, insert new ones
  if (items !== undefined) {
    const { error: delError } = await supabase
      .from("purchase_invoice_items")
      .delete()
      .eq("purchase_invoice_id", id);
    if (delError) throw delError;

    if (items.length > 0) {
      const preparedItems = items.map((item) => ({
        purchase_invoice_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.quantity * item.unit_cost,
      }));

      const { error: insError } = await supabase
        .from("purchase_invoice_items")
        .insert(preparedItems);
      if (insError) throw insError;
    }
  }

  return data;
}

export async function deletePurchaseInvoice(id) {
  const { error } = await supabase.from("purchase_invoices").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deletePurchaseInvoices(ids) {
  const { error } = await supabase.from("purchase_invoices").delete().in("id", ids);
  if (error) throw error;
  return true;
}
