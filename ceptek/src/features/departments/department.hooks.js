import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  deleteDepartments,
  DEPARTMENT_QUERY_KEY,
} from "./department.api";

export function useDepartmentQuery() {
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
    queryKey: [DEPARTMENT_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () =>
      getDepartments({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: debouncedSearch,
      }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return {
    rows: data?.data || [],
    rowCount: data?.count || 0,
    isLoading,
    isFetching,
    isError,
    error,
    paginationModel,
    setPaginationModel,
    searchText,
    setSearchText,
  };
}

export function useDepartmentMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [DEPARTMENT_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Department created successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to create department", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateDepartment(id, data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Department updated successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to update department", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Department deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete department", "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteDepartments,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Departments deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete departments", "error");
    },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
