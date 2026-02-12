import * as React from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getCustomers,
  deleteCustomer,
  deleteCustomers,
  getCustomerTypes,
} from "./customer.api";
import { customerColumns } from "./customer.columns";
import CustomerForm from "./CustomerForm";
import ProductActionDialogs from "../../componenets/ProductActionDialogs";

function normalizeTurkish(str = "") {
  return str
    .replace(/İ/g, "I")
    .replace(/I/g, "I")
    .replace(/ı/g, "i")
    .replace(/Ş/g, "S")
    .replace(/ş/g, "s")
    .replace(/Ğ/g, "G")
    .replace(/ğ/g, "g")
    .replace(/Ü/g, "U")
    .replace(/ü/g, "u")
    .replace(/Ö/g, "O")
    .replace(/ö/g, "o")
    .replace(/Ç/g, "C")
    .replace(/ç/g, "c")
    .toLowerCase();
}

export  function CustomerList() {
  const queryClient = useQueryClient();

  const [openAddDialog, setOpenAddDialog] = React.useState(false);
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openDeleteSelectedDialog, setOpenDeleteSelectedDialog] =
    React.useState(false);

  const [selectedCustomer, setSelectedCustomer] = React.useState(null);
  const [selectedIds, setSelectedIds] = React.useState(new Set());

  const [searchText, setSearchText] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const [customerTypeId, setCustomerTypeId] = React.useState("");

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // fetch customer types (for filter)
  const { data: customerTypes = [] } = useQuery({
    queryKey: ["customerTypes"],
    queryFn: getCustomerTypes,
  });

  // fetch customers (server side)
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "customers",
      paginationModel,
      debouncedSearch,
      customerTypeId,
    ],
    queryFn: () =>
      getCustomers({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: normalizeTurkish(debouncedSearch),
        customerTypeId,
      }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      setOpenDeleteDialog(false);
      setSelectedCustomer(null);
    },
  });

  const handleEditAction = (customer) => {
    setSelectedCustomer(customer);
    setOpenEditDialog(true);
  };

  const handleDeleteAction = (customer) => {
    setSelectedCustomer(customer);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCustomer) deleteMutation.mutate(selectedCustomer.id);
  };

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
    await deleteCustomers(Array.from(selectedIds));
    queryClient.invalidateQueries(["customers"]);
    setSelectedIds(new Set());
  };

  const columns = customerColumns(
    handleEditAction,
    handleDeleteAction,
    selectedIds,
    toggleSelect,
    rows,
    toggleSelectAll
  );

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {/* Header Controls */}
      <Stack direction="row" spacing={2} mb={2}>
        <Button variant="contained" onClick={() => setOpenAddDialog(true)}>
          Add Customer
        </Button>

        <Button
          variant="contained"
          color="error"
          disabled={selectedIds.size === 0}
          onClick={() => setOpenDeleteSelectedDialog(true)}
        >
          Delete Selected ({selectedIds.size})
        </Button>

        <TextField
          label="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Customer Type</InputLabel>
          <Select
            value={customerTypeId}
            label="Customer Type"
            onChange={(e) => setCustomerTypeId(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {customerTypes.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.type_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Paper sx={{ height: 650, width: "100%" }}>
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
        selectedProduct={selectedCustomer}
        handleDeleteConfirm={handleDeleteConfirm}
      />

      {openAddDialog && (
        <CustomerForm
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
        />
      )}

      {openEditDialog && selectedCustomer && (
        <CustomerForm
          open={openEditDialog}
          editRow={selectedCustomer}
          onClose={() => {
            setOpenEditDialog(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </Box>
  );
}
