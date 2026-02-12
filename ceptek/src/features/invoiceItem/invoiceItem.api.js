import supabase from "../../config/supabase";

// جلب الفواتير

// جلب الفواتير (كما هي)
export const getInvoices = async ({ page, pageSize, searchText }) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("invoices")
    .select(`
      *,
      customers (name),
      invoice_statuses (status_name)
    `, { count: "exact" })
    .order("id", { ascending: false })
    .range(from, to);

  if (searchText) {
    query = query.ilike("customers.name", `%${searchText}%`);
  }

  const { data, count, error } = await query;
  if (error) throw error;
  return { data, count };
};

// --- الدوال المضافة لخدمة الفاتورة من نفس الملف ---

export const getCustomersForSelect = async () => {
  const { data, error } = await supabase
    .from("customers")
    .select("id, name")
    .order("name");
  if (error) throw error;
  return data;
};

export const getInvoiceStatuses = async () => {
  const { data, error } = await supabase.from("invoice_statuses").select("*");
  if (error) throw error;
  return data;
};

export const saveCompleteInvoice = async (invoiceData, items) => {
  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .insert([invoiceData])
    .select()
    .single();

  if (invError) throw invError;

  if (items.length > 0) {
    const preparedItems = items.map(item => ({
      invoice_id: invoice.id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(preparedItems);

    if (itemsError) throw itemsError;
  }
  return invoice;
};

// حفظ الفاتورة مع أصنافها (Master-Detail Save)


