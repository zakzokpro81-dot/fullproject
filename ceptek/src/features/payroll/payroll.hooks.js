import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPayroll, createPayroll, updatePayroll, deletePayroll, deletePayrolls, PAYROLL_QUERY_KEY,
} from "./payroll.api";
import supabase from "../../config/supabase";

export function usePayrollQuery() {
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
    queryKey: [PAYROLL_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () => getPayroll({ page: paginationModel.page, pageSize: paginationModel.pageSize, searchText: debouncedSearch }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return { rows: data?.data || [], rowCount: data?.count || 0, isLoading, isFetching, isError, error, paginationModel, setPaginationModel, searchText, setSearchText };
}

export function usePayrollMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [PAYROLL_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createPayroll,
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Payroll created successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to create payroll", "error"); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updatePayroll(id, data),
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Payroll updated successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to update payroll", "error"); },
  });
  const deleteMutation = useMutation({
    mutationFn: deletePayroll,
    onSuccess: () => { invalidate(); showMessageDialog?.("Payroll deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete payroll", "error"); },
  });
  const deleteMultipleMutation = useMutation({
    mutationFn: deletePayrolls,
    onSuccess: () => { invalidate(); showMessageDialog?.("Payrolls deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete payrolls", "error"); },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}

export function usePayrollFormOptions() {
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
