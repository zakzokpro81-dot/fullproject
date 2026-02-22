import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getStockMovements,
  STOCK_MOVEMENT_QUERY_KEY,
} from "./stockMovement.api";

/**
 * Fetches the stock movement list with server-side pagination and debounced search.
 */
export function useStockMovementQuery() {
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
