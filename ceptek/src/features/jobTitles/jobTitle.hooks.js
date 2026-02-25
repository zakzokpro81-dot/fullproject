import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getJobTitles, createJobTitle, updateJobTitle, deleteJobTitle, deleteJobTitles, JOB_TITLE_QUERY_KEY,
} from "./jobTitle.api";
import supabase from "../../config/supabase";

export function useJobTitleQuery() {
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
    queryKey: [JOB_TITLE_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () => getJobTitles({ page: paginationModel.page, pageSize: paginationModel.pageSize, searchText: debouncedSearch }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return { rows: data?.data || [], rowCount: data?.count || 0, isLoading, isFetching, isError, error, paginationModel, setPaginationModel, searchText, setSearchText };
}

export function useJobTitleMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [JOB_TITLE_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createJobTitle,
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Job title created successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to create job title", "error"); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateJobTitle(id, data),
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Job title updated successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to update job title", "error"); },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteJobTitle,
    onSuccess: () => { invalidate(); showMessageDialog?.("Job title deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete job title", "error"); },
  });
  const deleteMultipleMutation = useMutation({
    mutationFn: deleteJobTitles,
    onSuccess: () => { invalidate(); showMessageDialog?.("Job titles deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err.message || "Failed to delete job titles", "error"); },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}

export function useJobTitleFormOptions() {
  const { data: departments = [] } = useQuery({
    queryKey: ["departments", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("id, name").eq("is_active", true);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
  return { departments };
}
