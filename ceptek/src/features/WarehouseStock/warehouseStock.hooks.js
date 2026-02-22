import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWarehouseStocks,
  createWarehouseStock,
  updateWarehouseStock,
  deleteWarehouseStock,
  deleteWarehouseStocks,
  getWarehouses,
  getProducts,
  WAREHOUSE_STOCK_QUERY_KEY,
} from "./warehouseStock.api";

// ── Query hook (paginated + debounced search) ────────────────────────────────
export function useWarehouseStockQuery() {
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
    queryKey: [WAREHOUSE_STOCK_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () =>
      getWarehouseStocks({
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

// ── Mutations hook ────────────────────────────────────────────────────────────
export function useWarehouseStockMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [WAREHOUSE_STOCK_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createWarehouseStock,
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Created successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to create", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateWarehouseStock(id, data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Updated successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to update", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWarehouseStock,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete", "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteWarehouseStocks,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete", "error");
    },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}

// ── Form reference data hook (warehouses + products for dropdowns) ────────────
export function useWarehouseStockFormOptions() {
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses_ref"],
    queryFn: getWarehouses,
    staleTime: 1000 * 60 * 10,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products_ref"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 10,
  });

  return { warehouses, products };
}
