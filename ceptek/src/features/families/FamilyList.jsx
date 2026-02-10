//الصفحة الرئيسية للـ Families، تعرض DataGrid، Toolbar، وDialog حذف.

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GridToolbar } from "@mui/x-data-grid";
import {
  getFamilies,
  createFamily,
  updateFamily,
  deleteFamily,
} from "./family.api";
import { familyColumns } from "./family.columns";
import FamilyForm from "./FamilyForm";
import ScrollToTopButton from "../../componenets/ScrollToTopButton";
import ProductActionDialogs from "../../componenets/ProductActionDialogs"; // تأكد من مسار الملف الصحيح

export function FamilyList() {
  const queryClient = useQueryClient();

  const [openForm, setOpenForm] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch families
  const { data: families = [], isLoading } = useQuery({
    queryKey: ["families"],
    queryFn: getFamilies,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createFamily,
    onSuccess: () => {
      queryClient.invalidateQueries(["families"]);
      setOpenForm(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateFamily,
    onSuccess: () => {
      queryClient.invalidateQueries(["families"]);
      setOpenForm(false);
      setSelectedFamily(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFamily,
    onSuccess: () => {
      queryClient.invalidateQueries(["families"]);
      setOpenDeleteDialog(false);
      setDeleteId(null);
    },
  });

  const handleAdd = () => {
    setSelectedFamily(null);
    setOpenForm(true);
  };

  const handleEdit = (family) => {
    setSelectedFamily(family);
    setOpenForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(deleteId);
  };

  const handleFormSubmit = (data) => {
    if (selectedFamily) {
            console.log("update",data)

      updateMutation.mutate({ id: selectedFamily.id, ...data });
    } else {
      console.log("create",data)
      createMutation.mutate(data);
      
    }
  };

  return (
    <Box p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Family</Typography>
        <Button variant="contained" onClick={handleAdd} sx={{ mb: 2 }}>
          Add Family
        </Button>
      </Box>

      <DataGrid
        rows={families}
        columns={familyColumns(handleEdit, handleDeleteClick)}
        loading={isLoading}
        autoHeight
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        sx={{
          width: "100%",
        }}
        showToolbar
        slots={{
          toolbar: GridToolbar,
        }}
      />

      <ScrollToTopButton />
      {/* Form Dialog */}
      <FamilyForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        defaultValues={selectedFamily}
        initialData={selectedFamily}
      />

      {/* Delete Confirmation Dialog */}

      {/* <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Delete Confirm</DialogTitle>

          <DialogContent>
            Are you sure you want to delete this family?{" "}
            <strong>{selectedFamily?.name}</strong>
            <br />
            no back
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogActions>
        </Dialog> */}

      <ProductActionDialogs
        //openDeleteSelectedDialog={openDeleteDialog}
        //setOpenDeleteSelectedDialog={setOpenDelete}
        //selectedIds={selectedFamily?.id}
        handleDeleteSelected={handleDeleteClick}
        openDeleteDialog={openDeleteDialog}
        setOpenDeleteDialog={setOpenDeleteDialog}
        selectedProduct={selectedFamily}
        handleDeleteConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
