import { useQuery } from "@tanstack/react-query";
import { getAccounts, ACCOUNT_QUERY_KEY } from "./account.api";

/**
 * Fetches the account list.
 */
export function useAccountQuery() {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [ACCOUNT_QUERY_KEY],
    queryFn: getAccounts,
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
