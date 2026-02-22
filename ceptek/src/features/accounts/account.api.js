import supabase from "../../config/supabase";

export const ACCOUNT_QUERY_KEY = "accounts";

export const getAccounts = async () => {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Supabase Select Error:", error.message);
    throw error;
  }
  return data;
};

export const createAccount = async (account) => {
  const { data, error } = await supabase
    .from("accounts")
    .insert([
      {
        name: account.name,
        account_type: account.account_type,
        balance: account.balance || 0,
        is_active: account.is_active ?? true,
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
};