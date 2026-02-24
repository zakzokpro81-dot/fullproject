import supabase from "../../config/supabase";

export const INVOICE_ITEM_QUERY_KEY = "invoiceItems";

export async function getCustomersForSelect() {
  const { data, error } = await supabase
    .from("customers")
    .select("id, name")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

export async function getInvoiceStatuses() {
  const { data, error } = await supabase
    .from("invoice_statuses")
    .select("id, status_name");
  if (error) throw new Error(error.message);
  return data;
}

export async function getProductVariants() {
  const { data, error } = await supabase
    .from("product_variants")
    .select("id, sku, products(name)");
  if (error) throw new Error(error.message);
  return data;
}

export async function saveCompleteInvoice(invoiceData, items) {
  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .insert(invoiceData)
    .select()
    .single();

  if (invError) throw new Error(invError.message);

  if (items.length > 0) {
    const preparedItems = items.map((item) => ({
      invoice_id: invoice.id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(preparedItems);

    if (itemsError) throw new Error(itemsError.message);
  }

  return invoice;
}
