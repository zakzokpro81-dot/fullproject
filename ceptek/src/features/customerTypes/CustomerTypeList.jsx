import * as React from "react";
import { Box, Paper, Typography, Button, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AddIcon from "@mui/icons-material/Add";

import { getCustomerTypes, deleteCustomerType } from "./customerType.api";
import { customerTypeColumns } from "./customerType.columns";
import CustomerTypeForm from "./CustomerTypeForm"; // سننشئه في الخطوة التالية
import ProductActionDialogs from "../../components/ProductActionDialogs"; // إعادة استخدام مكون الديالوغ الخاص بك

export function CustomerTypeList() {
  const queryClient = useQueryClient();

  // States
  const [openForm, setOpenForm] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  // Query: جلب البيانات من السيرفر
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["customerTypes", paginationModel],
    queryFn: () =>
      getCustomerTypes({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
      }),
    keepPreviousData: true,
  });

  // Mutation: حذف النوع
  const deleteMutation = useMutation({
    mutationFn: deleteCustomerType,
    onSuccess: () => {
      queryClient.invalidateQueries(["customerTypes"]);
      setOpenDeleteDialog(false);
      setSelectedType(null);
    },
  });

  // Handlers
  const handleAddClick = () => {
    setSelectedType(null);
    setOpenForm(true);
  };

  const handleEditAction = (type) => {
    setSelectedType(type);
    setOpenForm(true);
  };

  const handleDeleteAction = (type) => {
    setSelectedType(type);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedType) deleteMutation.mutate(selectedType.id);
  };

  const columns = customerTypeColumns(handleEditAction, handleDeleteAction);

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {/* Header بسيط متوافق مع تصميمك */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            إدارة أنواع الزبائن
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            إضافة نوع جديد
          </Button>
        </Stack>
      </Paper>

      {/* الجدول */}
      <Paper sx={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={data?.data || []}
          rowCount={data?.count || 0}
          loading={isLoading || isFetching}
          columns={columns}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableSelectionOnClick
        />
      </Paper>

      {/* ديالوغ الحذف - إعادة استخدام المكون الخاص بك */}
      <ProductActionDialogs
        openDeleteDialog={openDeleteDialog}
        setOpenDeleteDialog={setOpenDeleteDialog}
        selectedProduct={selectedType} // المكون يتوقع selectedProduct سنمرر له النوع
        handleDeleteConfirm={handleDeleteConfirm}
        // بما أننا لا نحتاج الحذف الجماعي هنا حالياً سأمرر قيم فارغة
        openDeleteSelectedDialog={false}
      />

      {/* فورم الإضافة والتعديل */}
      {openForm && (
        <CustomerTypeForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          initialData={selectedType}
        />
      )}
    </Box>
  );
}
