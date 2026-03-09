import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getSupplierFinishedOrders,
  getSupplierFinishedOrderFilterData,
  SUPPLIER_FINISHED_ORDER_QUERY_KEY,
} from "./supplierFinishedOrder.api";

export function useSupplierFinishedOrderQuery({
  supplierId,
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
      SUPPLIER_FINISHED_ORDER_QUERY_KEY,
      paginationModel,
      debouncedSearch,
      supplierId,
      warehouseId,
      dateFrom,
      dateTo,
    ],
    queryFn: () =>
      getSupplierFinishedOrders({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: debouncedSearch,
        supplierId,
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

export function useSupplierFinishedOrderFilterData() {
  const { data, isLoading } = useQuery({
    queryKey: [SUPPLIER_FINISHED_ORDER_QUERY_KEY, "filterData"],
    queryFn: getSupplierFinishedOrderFilterData,
    staleTime: 1000 * 60 * 10,
  });

  return {
    suppliers: data?.suppliers || [],
    warehouses: data?.warehouses || [],
    isLoading,
  };
}
