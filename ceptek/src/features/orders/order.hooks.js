import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  createOrderAction,
  ORDER_QUERY_KEY,
} from "./order.api";

/**
 * Fetches the order list.
 */
export function useOrderQuery() {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [ORDER_QUERY_KEY],
    queryFn: getOrders,
    staleTime: 1000 * 60 * 5,
  });

  return {
    rows: data || [],
    isLoading,
    isFetching,
    isError,
    error,
  };
}

/**
 * Returns create mutation with cache invalidation.
 */
export function useOrderMutations({ onSuccess, showSnackbar }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createOrderAction,
    onSuccess: () => {
      invalidate();
      showSnackbar("Order created successfully", "success");
      onSuccess();
    },
    onError: (error) => {
      showSnackbar(error.message || "Failed to create order", "error");
    },
  });

  return { createMutation };
}
