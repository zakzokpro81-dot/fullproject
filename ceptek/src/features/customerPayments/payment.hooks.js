import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
  deletePayments,
  PAYMENT_QUERY_KEY,
} from "./payment.api";

/**
 * Fetches the payment list with server-side pagination and debounced search.
 */
export function usePaymentQuery() {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const rowCountRef = useRef(0);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [PAYMENT_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () =>
      getPayments({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: debouncedSearch,
      }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  if (data?.count !== undefined) {
    rowCountRef.current = data.count;
  }

  return {
    rows: data?.data || [],
    rowCount: rowCountRef.current,
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

/**
 * Returns create / update / delete mutations with cache invalidation.
 */
export function usePaymentMutations({ onSuccess, showSnackbar }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [PAYMENT_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      invalidate();
      showSnackbar("Payment created successfully", "success");
      onSuccess();
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to create payment", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updatePayment(id, data),
    onSuccess: () => {
      invalidate();
      showSnackbar("Payment updated successfully", "success");
      onSuccess();
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to update payment", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      invalidate();
      showSnackbar("Payment deleted successfully", "success");
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to delete payment", "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deletePayments,
    onSuccess: () => {
      invalidate();
      showSnackbar("Payments deleted successfully", "success");
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to delete payments", "error");
    },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
