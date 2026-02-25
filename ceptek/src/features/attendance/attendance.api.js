import supabase from "../../config/supabase";

export const ATTENDANCE_QUERY_KEY = "attendance";

export async function getAttendance({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("attendance")
    .select(
      `id, employee_id, work_date, check_in, check_out, status, notes,
       employees:employees!attendance_employee_id_fkey ( id, first_name, last_name )`,
      { count: "exact" }
    )
    .order("work_date", { ascending: false })
    .range(from, to);

  if (searchText) {
    query = query.or(`work_date.ilike.%${searchText}%,notes.ilike.%${searchText}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createAttendance(payload) {
  const { data, error } = await supabase.from("attendance").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateAttendance(id, payload) {
  const { data, error } = await supabase.from("attendance").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAttendance(id) {
  const { error } = await supabase.from("attendance").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteAttendances(ids) {
  const { error } = await supabase.from("attendance").delete().in("id", ids);
  if (error) throw error;
  return true;
}
