import * as React from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getCustomerTypes,
  deleteCustomerType,
  deleteCustomerTypes,
} from "./customerType.api";

import { customerTypeColumns } from "./customerType.columns";
import ProductActionDialogs from "../../componenets/ProductActionDialogs";

// لاحقاً ستربطهم بنماذج الإضافة والتعديل
// import AddCustomerTypeForm from "./AddCustomerTypeForm";
// import EditCustomerTypeForm from "./EditCustomerTypeForm";

export function CustomerTypeList() {
  const queryClient = useQueryClient();

  const [openAddDialog, setOpenAddDialog] = React.useState(false);
  const [openEditDialog, setOpenEditDialog] = React.useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openDeleteSelectedDialog, setOpenDeleteSelectedDialog] =
    React.useState(false);

  const [selectedCustomerType, setSelectedCustomerType] = React.useState(null);
  const [selectedIds, setSelectedIds] = React.useState(new Set());

  const [searchText, setSearchText] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["customerTypes", paginationModel, debouncedSearch],
    queryFn: () =>
      getCustomerTypes({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: debouncedSearch,
      }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomerType,
    onSuccess: () => {
      queryClient.invalidateQueries(["customerTypes"]);
      setOpenDeleteDialog(false);
      setSelectedCustomerType(null);
    },
  });

  const rows = data?.data || [];

  const toggleSelectAll = () => {
    const allSelected =
      rows.length > 0 && rows.every((r) => selectedIds.has(r.id));

    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleDeleteSelected = async () => {
    await deleteCustomerTypes(Array.from(selectedIds));
    queryClient.invalidateQueries(["customerTypes"]);
    setSelectedIds(new Set());
  };

  const handleDeleteAction = (row) => {
    setSelectedCustomerType(row);
    setOpenDeleteDialog(true);
  };

  const handleEditAction = (row) => {
    setSelectedCustomerType(row);
    setOpenEditDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCustomerType) {
      deleteMutation.mutate(selectedCustomerType.id);
    }
  };

  const columns = customerTypeColumns(
    handleEditAction,
    handleDeleteAction,
    selectedIds,
    toggleSelect,
    rows,
    toggleSelectAll
  );

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {/* Toolbar */}
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          size="small"
          label="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <Button
          variant="contained"
          onClick={() => setOpenAddDialog(true)}
        >
          Add Customer Type
        </Button>

        {selectedIds.size > 0 && (
          <Button
            color="error"
            variant="contained"
            onClick={() => setOpenDeleteSelectedDialog(true)}
          >
            Delete Selected ({selectedIds.size})
          </Button>
        )}
      </Stack>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          rowCount={data?.count || 0}
          loading={isLoading || isFetching}
          columns={columns}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableSelectionOnClick
        />
      </Paper>

      <ProductActionDialogs
        openDeleteSelectedDialog={openDeleteSelectedDialog}
        setOpenDeleteSelectedDialog={setOpenDeleteSelectedDialog}
        selectedIds={selectedIds}
        handleDeleteSelected={handleDeleteSelected}
        openDeleteDialog={openDeleteDialog}
        setOpenDeleteDialog={setOpenDeleteDialog}
        selectedProduct={selectedCustomerType}
        handleDeleteConfirm={handleDeleteConfirm}
      />

      {/* لاحقاً */}
      {/*
      {openAddDialog && (
        <AddCustomerTypeForm
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
        />
      )}

      {openEditDialog && selectedCustomerType && (
        <EditCustomerTypeForm
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setSelectedCustomerType(null);
          }}
          customerType={selectedCustomerType}
        />
      )}
      */}
    </Box>
  );
}
