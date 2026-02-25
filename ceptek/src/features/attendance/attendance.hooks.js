import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAttendance, createAttendance, updateAttendance, deleteAttendance, deleteAttendances, ATTENDANCE_QUERY_KEY,
} from "./attendance.api";
import supabase from "../../config/supabase";

export function useAttendanceQuery() {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [ATTENDANCE_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () => getAttendance({ page: paginationModel.page, pageSize: paginationModel.pageSize, searchText: debouncedSearch }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return { rows: data?.data || [], rowCount: data?.count || 0, isLoading, isFetching, isError, error, paginationModel, setPaginationModel, searchText, setSearchText };
}

export function useAttendanceMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [ATTENDANCE_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createAttendance,
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Attendance recorded successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to record attendance", "error"); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAttendance(id, data),
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Attendance updated successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to update attendance", "error"); },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAttendance,
    onSuccess: () => { invalidate(); showMessageDialog?.("Attendance deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete attendance", "error"); },
  });
  const deleteMultipleMutation = useMutation({
    mutationFn: deleteAttendances,
    onSuccess: () => { invalidate(); showMessageDialog?.("Attendances deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete attendances", "error"); },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}

export function useAttendanceFormOptions() {
  const { data: employees = [] } = useQuery({
    queryKey: ["employees", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("id, first_name, last_name").eq("is_active", true);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  return { employees };
}
