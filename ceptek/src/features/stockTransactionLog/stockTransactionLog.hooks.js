import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getStockTransactionLogs,
  getStockTransactionLogFilterData,
  STOCK_TRANSACTION_LOG_QUERY_KEY,
} from "./stockTransactionLog.api";

export function useStockTransactionLogQuery({
  movementTypeId,
  warehouseId,
  dateFrom,
  dateTo,
} = {}) {
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

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [
      STOCK_TRANSACTION_LOG_QUERY_KEY,
      paginationModel,
      debouncedSearch,
      movementTypeId,
      warehouseId,
      dateFrom,
      dateTo,
    ],
    queryFn: () =>
      getStockTransactionLogs({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: debouncedSearch,
        movementTypeId,
        warehouseId,
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

export function useStockTransactionLogFilterData() {
  const { data, isLoading } = useQuery({
    queryKey: [STOCK_TRANSACTION_LOG_QUERY_KEY, "filterData"],
    queryFn: getStockTransactionLogFilterData,
    staleTime: 1000 * 60 * 10,
  });

  return {
    movementTypes: data?.movementTypes || [],
    warehouses: data?.warehouses || [],
    isLoading,
  };
}
