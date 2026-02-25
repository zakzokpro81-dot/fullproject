import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSalaryComponents, createSalaryComponent, updateSalaryComponent, deleteSalaryComponent, deleteSalaryComponents, SALARY_COMPONENT_QUERY_KEY,
} from "./salaryComponent.api";

export function useSalaryComponentQuery() {
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
    queryKey: [SALARY_COMPONENT_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () => getSalaryComponents({ page: paginationModel.page, pageSize: paginationModel.pageSize, searchText: debouncedSearch }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return { rows: data?.data || [], rowCount: data?.count || 0, isLoading, isFetching, isError, error, paginationModel, setPaginationModel, searchText, setSearchText };
}

export function useSalaryComponentMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [SALARY_COMPONENT_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createSalaryComponent,
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Salary component created successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to create salary component", "error"); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSalaryComponent(id, data),
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Salary component updated successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to update salary component", "error"); },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSalaryComponent,
    onSuccess: () => { invalidate(); showMessageDialog?.("Salary component deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete salary component", "error"); },
  });
  const deleteMultipleMutation = useMutation({
    mutationFn: deleteSalaryComponents,
    onSuccess: () => { invalidate(); showMessageDialog?.("Salary components deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete salary components", "error"); },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
