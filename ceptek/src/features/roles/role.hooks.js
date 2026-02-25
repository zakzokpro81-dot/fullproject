import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoles, createRole, updateRole, deleteRole, deleteRoles, ROLE_QUERY_KEY } from "./role.api";

export function useRoleQuery() {
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
    queryKey: [ROLE_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () => getRoles({ page: paginationModel.page, pageSize: paginationModel.pageSize, searchText: debouncedSearch }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return { rows: data?.data || [], rowCount: data?.count || 0, isLoading, isFetching, isError, error, paginationModel, setPaginationModel, searchText, setSearchText };
}

export function useRoleMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [ROLE_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Role created successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to create role", "error"); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateRole(id, data),
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Role updated successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to update role", "error"); },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => { invalidate(); showMessageDialog?.("Role deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete role", "error"); },
  });
  const deleteMultipleMutation = useMutation({
    mutationFn: deleteRoles,
    onSuccess: () => { invalidate(); showMessageDialog?.("Roles deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete roles", "error"); },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
