import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getCustomerFinishedOrders,
  getFinishedOrderFilterData,
  CUSTOMER_FINISHED_ORDER_QUERY_KEY,
} from "./customerFinishedOrder.api";

export function useCustomerFinishedOrderQuery({
  customerId,
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
      CUSTOMER_FINISHED_ORDER_QUERY_KEY,
      paginationModel,
      debouncedSearch,
      customerId,
      warehouseId,
      dateFrom,
      dateTo,
    ],
    queryFn: () =>
      getCustomerFinishedOrders({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: debouncedSearch,
        customerId,
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

export function useFinishedOrderFilterData() {
  const { data, isLoading } = useQuery({
    queryKey: [CUSTOMER_FINISHED_ORDER_QUERY_KEY, "filterData"],
    queryFn: getFinishedOrderFilterData,
    staleTime: 1000 * 60 * 10,
  });

  return {
    customers: data?.customers || [],
    warehouses: data?.warehouses || [],
    isLoading,
  };
}
