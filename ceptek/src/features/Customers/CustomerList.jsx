import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AddIcon from "@mui/icons-material/Add";

import { getCustomers, deleteCustomer, deleteCustomers } from "./customer.api"; // تأكد من وجود deleteCustomers في الـ API
import { getCustomerTypes } from "../customerTypes/customerType.api";
import { customerColumns } from "./customer.columns";
import CustomerForm from "./CustomerForm";
import ProductActionDialogs from "../../components/ProductActionDialogs";

export function CustomerList() {
  const queryClient = useQueryClient();

  const [openForm, setOpenForm] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openDeleteSelectedDialog, setOpenDeleteSelectedDialog] =
    React.useState(false);

  // منطق الاختيار المخصص (كما في مثالك)
  const [selectedIds, setSelectedIds] = React.useState(new Set());

  const [searchText, setSearchText] = React.useState("");
  const [customerTypeId, setCustomerTypeId] = React.useState("");
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["customers", paginationModel, searchText, customerTypeId],
    queryFn: () =>
      getCustomers({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText,
        customerTypeId,
      }),
    keepPreviousData: true,
  });

  const { data: typesData } = useQuery({
    queryKey: ["customerTypesSelect"],
    queryFn: () => getCustomerTypes({ page: 0, pageSize: 100 }),
  });

  // الحذف المفرد
  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      setOpenDeleteDialog(false);
      setSelectedCustomer(null);
    },
  });

  // منطق اختيار الكل
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

  // تنفيذ الحذف الجماعي
  const handleDeleteSelected = async () => {
    await deleteCustomers(Array.from(selectedIds));
    queryClient.invalidateQueries(["customers"]);
    setSelectedIds(new Set());
    setOpenDeleteSelectedDialog(false);
  };

  const columns = customerColumns(
    (cust) => {
      setSelectedCustomer(cust);
      setOpenForm(true);
    },
    (cust) => {
      setSelectedCustomer(cust);
      setOpenDeleteDialog(true);
    },
    selectedIds,
    toggleSelect,
    rows,
    toggleSelectAll,
  );

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Customers Management
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              color="error"
              variant="contained"
              disabled={selectedIds.size === 0}
              onClick={() => setOpenDeleteSelectedDialog(true)}
            >
              Delete Selected ({selectedIds.size})
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedCustomer(null);
                setOpenForm(true);
              }}
            >
              Add Customer
            </Button>
          </Stack>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Search name or store..."
            size="small"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={customerTypeId}
              label="Type"
              onChange={(e) => setCustomerTypeId(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              {typesData?.data?.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.type_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

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
        openDeleteDialog={openDeleteDialog}
        setOpenDeleteDialog={setOpenDeleteDialog}
        selectedProduct={selectedCustomer}
        handleDeleteConfirm={() => deleteMutation.mutate(selectedCustomer.id)}
        // الحذف الجماعي
        openDeleteSelectedDialog={openDeleteSelectedDialog}
        setOpenDeleteSelectedDialog={setOpenDeleteSelectedDialog}
        selectedIds={selectedIds}
        handleDeleteSelected={handleDeleteSelected}
      />

      {openForm && (
        <CustomerForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          initialData={selectedCustomer}
          customerTypes={typesData?.data || []}
        />
      )}
    </Box>
  );
}
