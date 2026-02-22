import { useQuery } from "@tanstack/react-query";
import {
  getInvoices,
  getDailySummary,
  INVOICE_QUERY_KEY,
} from "./invoice.api";

/**
 * Fetches the invoice list.
 */
export function useInvoiceQuery() {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [INVOICE_QUERY_KEY],
    queryFn: getInvoices,
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
 * Fetches the daily summary for the dashboard.
 */
export function useDailySummaryQuery() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [INVOICE_QUERY_KEY, "dailySummary"],
    queryFn: getDailySummary,
    staleTime: 1000 * 60 * 5,
  });

  return {
    summary: data || null,
    isLoading,
    isError,
    error,
  };
}
