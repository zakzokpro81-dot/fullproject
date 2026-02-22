import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  deleteCustomers,
  CUSTOMER_QUERY_KEY,
} from "./customer.api";

/**
 * Fetches the customer list with server-side pagination and debounced search.
 */
export function useCustomerQuery({ customerTypeId } = {}) {
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
    queryKey: [CUSTOMER_QUERY_KEY, paginationModel, debouncedSearch, customerTypeId],
    queryFn: () =>
      getCustomers({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: debouncedSearch,
        customerTypeId,
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
export function useCustomerMutations({ onSuccess, showSnackbar }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [CUSTOMER_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      invalidate();
      showSnackbar("Customer created successfully", "success");
      onSuccess();
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to create customer", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    onSuccess: () => {
      invalidate();
      showSnackbar("Customer updated successfully", "success");
      onSuccess();
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to update customer", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      invalidate();
      showSnackbar("Customer deleted successfully", "success");
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to delete customer", "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteCustomers,
    onSuccess: () => {
      invalidate();
      showSnackbar("Customers deleted successfully", "success");
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to delete customers", "error");
    },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
