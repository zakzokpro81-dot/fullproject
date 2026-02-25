import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployees, createEmployee, updateEmployee, deleteEmployee, deleteEmployees, EMPLOYEE_QUERY_KEY,
} from "./employee.api";
import supabase from "../../config/supabase";

export function useEmployeeQuery() {
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
    queryKey: [EMPLOYEE_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () => getEmployees({ page: paginationModel.page, pageSize: paginationModel.pageSize, searchText: debouncedSearch }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return { rows: data?.data || [], rowCount: data?.count || 0, isLoading, isFetching, isError, error, paginationModel, setPaginationModel, searchText, setSearchText };
}

export function useEmployeeMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [EMPLOYEE_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Employee created successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to create employee", "error"); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateEmployee(id, data),
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Employee updated successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to update employee", "error"); },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => { invalidate(); showMessageDialog?.("Employee deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete employee", "error"); },
  });
  const deleteMultipleMutation = useMutation({
    mutationFn: deleteEmployees,
    onSuccess: () => { invalidate(); showMessageDialog?.("Employees deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete employees", "error"); },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}

export function useEmployeeFormOptions() {
  const { data: departments = [] } = useQuery({
    queryKey: ["departments", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("id, name").eq("is_active", true);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: jobTitles = [] } = useQuery({
    queryKey: ["job_titles", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_titles").select("id, title").eq("is_active", true);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  return { departments, jobTitles };
}
