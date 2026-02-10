import supabase from "../../config/supabase";

export const getAttributes = async () => {
  const { data, error } = await supabase
    .from("attributes")
    .select("*")
    .order("id", { ascending: false });

  if (error) throw error;
  return data;
};

export const createAttribute = async (payload) => {
  const { data, error } = await supabase
    .from("attributes")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAttribute = async ({ id, payload }) => {
  const { data, error } = await supabase
    .from("attributes")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAttribute = async (id) => {
  const { error } = await supabase
    .from("attributes")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return id;
};
