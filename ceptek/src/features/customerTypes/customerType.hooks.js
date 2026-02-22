import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomerTypes,
  createCustomerType,
  updateCustomerType,
  deleteCustomerType,
  CUSTOMER_TYPE_QUERY_KEY,
} from "./customerType.api";

/**
 * Fetches the customer type list with server-side pagination.
 */
export function useCustomerTypeQuery() {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const rowCountRef = useRef(0);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [CUSTOMER_TYPE_QUERY_KEY, paginationModel],
    queryFn: () =>
      getCustomerTypes({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
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
  };
}

/**
 * Returns create / update / delete mutations with cache invalidation.
 */
export function useCustomerTypeMutations({ onSuccess, showSnackbar }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [CUSTOMER_TYPE_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createCustomerType,
    onSuccess: () => {
      invalidate();
      showSnackbar("Customer type created successfully", "success");
      onSuccess();
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to create customer type", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCustomerType(id, data),
    onSuccess: () => {
      invalidate();
      showSnackbar("Customer type updated successfully", "success");
      onSuccess();
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to update customer type", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomerType,
    onSuccess: () => {
      invalidate();
      showSnackbar("Customer type deleted successfully", "success");
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to delete customer type", "error");
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
