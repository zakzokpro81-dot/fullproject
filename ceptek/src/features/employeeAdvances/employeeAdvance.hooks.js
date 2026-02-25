import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployeeAdvances, createEmployeeAdvance, updateEmployeeAdvance, deleteEmployeeAdvance, deleteEmployeeAdvances, EMPLOYEE_ADVANCE_QUERY_KEY,
} from "./employeeAdvance.api";
import supabase from "../../config/supabase";

export function useEmployeeAdvanceQuery() {
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
    queryKey: [EMPLOYEE_ADVANCE_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () => getEmployeeAdvances({ page: paginationModel.page, pageSize: paginationModel.pageSize, searchText: debouncedSearch }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return { rows: data?.data || [], rowCount: data?.count || 0, isLoading, isFetching, isError, error, paginationModel, setPaginationModel, searchText, setSearchText };
}

export function useEmployeeAdvanceMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [EMPLOYEE_ADVANCE_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createEmployeeAdvance,
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Advance created successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to create advance", "error"); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateEmployeeAdvance(id, data),
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Advance updated successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to update advance", "error"); },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteEmployeeAdvance,
    onSuccess: () => { invalidate(); showMessageDialog?.("Advance deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete advance", "error"); },
  });
  const deleteMultipleMutation = useMutation({
    mutationFn: deleteEmployeeAdvances,
    onSuccess: () => { invalidate(); showMessageDialog?.("Advances deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete advances", "error"); },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}

export function useEmployeeAdvanceFormOptions() {
  const { data: employees = [] } = useQuery({
    queryKey: ["employees", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("id, first_name, last_name").eq("is_active", true);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("accounts").select("id, name");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  return { employees, accounts };
}
