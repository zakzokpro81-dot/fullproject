import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStockMovements,
  getMovementTypes,
  getWarehouses,
  getProductsForMovement,
  createStockMovement,
  STOCK_MOVEMENT_QUERY_KEY,
} from "./stockMovement.api";

export function useStockMovementQuery() {
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
    queryKey: [STOCK_MOVEMENT_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () =>
      getStockMovements({
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

export function useStockMovementFormOptions() {
  const { data: movementTypes = [] } = useQuery({
    queryKey: ["movTypes"],
    queryFn: getMovementTypes,
  });
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
  });
  const { data: products = [] } = useQuery({
    queryKey: ["productsForMovement"],
    queryFn: getProductsForMovement,
  });
  return { movementTypes, warehouses, products };
}

export function useStockMovementMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [STOCK_MOVEMENT_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const createMutation = useMutation({
    mutationFn: createStockMovement,
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Movement recorded successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err?.message || "Failed to record movement", "error");
    },
  });

  return { createMutation };
}
