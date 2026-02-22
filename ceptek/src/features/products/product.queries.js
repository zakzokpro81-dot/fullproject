import supabase from "../../config/supabase";

export const PRODUCT_QUERY_KEY = "products";

/**
 * Fetch paginated products with optional search, warehouse, and type filters.
 */
export const getProducts = async ({
  page,
  pageSize,
  searchText,
  warehouseId,
  typeId,
}) => {
  let query = supabase
    .from("products")
    .select(
      `
      *,
      family:families(id, name),
      brand:brands(id, name),
      product_type:product_types(id, name),
      attributes:product_attribute_values(
        id, attribute_id,
        attribute:attributes(name, slug)
      ),
      warehouse_stock (
        quantity,
        warehouse_id,
        warehouse:warehouses(name)
      )
    `,
      { count: "exact" },
    )
    .eq("is_active", true);

  if (searchText) query = query.ilike("name", `%${searchText}%`);
  if (typeId && typeId !== "") query = query.eq("product_type_id", typeId);

  if (warehouseId && warehouseId !== "") {
    const cleanId = Number(warehouseId);
    const { data: stockData, error: stockError } = await supabase
      .from("warehouse_stock")
      .select("product_id")
      .eq("warehouse_id", cleanId);

    if (stockError) {
      console.error("Stock API Error:", stockError.message);
    }

    if (stockData && stockData.length > 0) {
      const productIds = stockData.map((item) => item.product_id);
      query = query.in("id", productIds);
    } else {
      return { data: [], count: 0 };
    }
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .range(from, to)
    .order("id", { ascending: false });

  if (error) throw error;
  return { data, count };
};

/**
 * Fetch product categories.
 */
export const getCategories = async () => {
  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data;
};

/**
 * Fetch models by family ID.
 */
export const getModels = async (familyId) => {
  if (!familyId) return [];
  const { data, error } = await supabase
    .from("models")
    .select("*")
    .eq("family", familyId)
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data;
};

/**
 * Fetch attributes (with options) for a given product type.
 */
export async function getAttributes(productTypeId) {
  if (!productTypeId) return [];

  const { data: typeAttrs, error: typeAttrsError } = await supabase
    .from("product_type_attributes")
    .select(
      `
      attributes (
        id, name, slug, data_type, has_options, is_active
      )
    `,
    )
    .eq("product_type_id", productTypeId)
    .eq("attributes.is_active", true);

  if (typeAttrsError) throw typeAttrsError;

  const attributes = await Promise.all(
    typeAttrs.map(async (ta) => {
      const attr = ta.attributes;
      if (attr.has_options) {
        const { data: options, error: optionsError } = await supabase
          .from("attribute_options")
          .select("id,value,slug")
          .eq("attribute_id", attr.id);
        if (optionsError) throw optionsError;
        return { ...attr, options: options || [] };
      }
      return { ...attr, options: [] };
    }),
  );

  return attributes;
}

/**
 * Fetch attribute values for a specific product.
 */
export async function getProductAttributes(productId) {
  const { data, error } = await supabase
    .from("product_attribute_values")
    .select("*")
    .eq("product_id", productId);
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch warehouse stock location for a product.
 */
export const getProductStockLocation = async (productId) => {
  const { data, error } = await supabase
    .from("warehouse_stock")
    .select(
      `
      id, quantity, warehouse_id, product_id,
      warehouse:warehouses (id, name)
    `,
    )
    .eq("product_id", productId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching stock location:", error);
    throw error;
  }
  return data;
};

/**
 * Fetch all warehouses.
 */
export async function getWarehouses() {
  const { data, error } = await supabase
    .from("warehouses")
    .select("id, name")
    .order("id", { ascending: true });

  if (error) {
    console.error("Failed to fetch warehouses:", error);
    return [];
  }
  return data;
}

/**
 * Fetch product types, optionally filtered by category.
 */
export const getProductTypes = async (categoryId = null, fetchAll = false) => {
  if (!fetchAll && !categoryId) return [];

  let query = supabase.from("product_types").select("*").order("name");

  if (categoryId && typeof categoryId !== "object") {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};
