import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  postJournalEntry,
  getAccountsForJournal,
  JOURNAL_QUERY_KEY,
} from "./journalEntry.api";

export function useJournalEntryQuery({
  transactionType = "",
  dateFrom = "",
  dateTo = "",
} = {}) {
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
    queryKey: [JOURNAL_QUERY_KEY, paginationModel, debouncedSearch, transactionType, dateFrom, dateTo],
    queryFn: () =>
      getJournalEntries({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: debouncedSearch,
        transactionType,
        dateFrom,
        dateTo,
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

export function useJournalEntryMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [JOURNAL_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createJournalEntry,
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Journal entry created successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || "Failed to create journal entry", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateJournalEntry(id, data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Journal entry updated successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || "Failed to update journal entry", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJournalEntry,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Journal entry deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || "Failed to delete journal entry", "error");
    },
  });

  const postMutation = useMutation({
    mutationFn: postJournalEntry,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Journal entry posted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || "Failed to post journal entry", "error");
    },
  });

  return { createMutation, updateMutation, deleteMutation, postMutation };
}

export function useJournalAccounts() {
  return useQuery({
    queryKey: ["accountsForJournal"],
    queryFn: getAccountsForJournal,
    staleTime: 1000 * 60 * 10,
  });
}
