import supabase from "../../config/supabase";


export const getWarehouseStock = async () => {
    const { data, error } = await supabase
        .from("warehouse_stock")
        .select(`
      id,
      quantity,
      products (
        id,
        name,
        sku,
        brands (
          id,
          name
        )
      ),
      warehouses (
        id,
        name
      )
    `);

    if (error) throw error;
    return data;
};

export const getWarehouses = async () => {
    const { data, error } = await supabase
        .from("warehouses")
        .select("id, name");

    if (error) throw error;
    return data;
};

export const getBrands = async () => {
    const { data, error } = await supabase
        .from("brands")
        .select("id, name");

    if (error) throw error;
    return data;
};
