import supabase from "../../config/supabase";

export const JOB_TITLE_QUERY_KEY = "job_titles";

export async function getJobTitles({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("job_titles")
    .select(
      `id, title, is_active, department_id,
       departments:departments!job_titles_department_id_fkey ( id, name )`,
      { count: "exact" }
    )
    .order("id", { ascending: true })
    .range(from, to);

  if (searchText) {
    query = query.or(`title.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createJobTitle(payload) {
  const { data, error } = await supabase.from("job_titles").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateJobTitle(id, payload) {
  const { data, error } = await supabase.from("job_titles").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteJobTitle(id) {
  const { error } = await supabase.from("job_titles").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteJobTitles(ids) {
  const { error } = await supabase.from("job_titles").delete().in("id", ids);
  if (error) throw error;
  return true;
}
