import supabase from "../../config/supabase";

const TABLE_NAME = "journal_entries";
const LINES_TABLE = "journal_entry_lines";

export const JOURNAL_QUERY_KEY = "journal_entries";

/* ───────── LIST ───────── */
export async function getJournalEntries({
  page = 0,
  pageSize = 10,
  searchText = "",
  transactionType = "",
  dateFrom = "",
  dateTo = "",
} = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE_NAME)
    .select(
      `id, entry_number, entry_date, transaction_type, description, reference,
       is_posted, posted_at, is_reversed, created_at,
       journal_entry_lines ( id, account_id, debit, credit, description,
         accounts:accounts!journal_entry_lines_account_id_fkey ( id, account_code, name ) )`,
      { count: "exact" }
    )
    .order("entry_date", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (transactionType) query = query.eq("transaction_type", transactionType);
  if (dateFrom) query = query.gte("entry_date", dateFrom);
  if (dateTo) query = query.lte("entry_date", dateTo);
  if (searchText) {
    const like = `%${searchText}%`;
    query = query.or(`entry_number.ilike.${like},description.ilike.${like},reference.ilike.${like}`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  // Compute totals on the fly for display
  const enriched = (data || []).map((entry) => {
    const lines = entry.journal_entry_lines || [];
    const totalAmount = lines.reduce((s, l) => s + (l.debit || 0), 0);
    const accountsSummary = lines
      .map((l) => l.accounts?.name)
      .filter(Boolean)
      .join(", ");
    return { ...entry, totalAmount, accountsSummary };
  });

  return { data: enriched, count };
}

/* ───────── CREATE ───────── */
export async function createJournalEntry(payload) {
  const { lines, ...header } = payload;

  const { data: entry, error: hErr } = await supabase
    .from(TABLE_NAME)
    .insert(header)
    .select()
    .single();
  if (hErr) throw hErr;

  const lineRows = lines.map((l) => ({
    journal_entry_id: entry.id,
    account_id: l.account_id,
    debit: l.debit || 0,
    credit: l.credit || 0,
    description: l.description || "",
  }));

  const { error: lErr } = await supabase.from(LINES_TABLE).insert(lineRows);
  if (lErr) throw lErr;

  return entry;
}

/* ───────── UPDATE (draft only) ───────── */
export async function updateJournalEntry(id, payload) {
  const { lines, ...header } = payload;

  const { data: entry, error: hErr } = await supabase
    .from(TABLE_NAME)
    .update(header)
    .eq("id", id)
    .select()
    .single();
  if (hErr) throw hErr;

  // Delete old lines, insert new ones
  const { error: dErr } = await supabase
    .from(LINES_TABLE)
    .delete()
    .eq("journal_entry_id", id);
  if (dErr) throw dErr;

  const lineRows = lines.map((l) => ({
    journal_entry_id: id,
    account_id: l.account_id,
    debit: l.debit || 0,
    credit: l.credit || 0,
    description: l.description || "",
  }));

  const { error: lErr } = await supabase.from(LINES_TABLE).insert(lineRows);
  if (lErr) throw lErr;

  return entry;
}

/* ───────── POST ───────── */
export async function postJournalEntry(id) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ is_posted: true, posted_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ───────── DELETE (draft only) ───────── */
export async function deleteJournalEntry(id) {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
  if (error) throw error;
  return true;
}

/* ───────── ACCOUNTS for dropdown ───────── */
export async function getAccountsForJournal() {
  const { data, error } = await supabase
    .from("accounts")
    .select("id, account_code, name, account_type, account_subtype")
    .eq("is_active", true)
    .order("account_code", { ascending: true });
  if (error) throw error;
  return data || [];
}
