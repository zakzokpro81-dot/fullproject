import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ScrollToTopButton from "../../componenets/ScrollToTopButton";

import { getModels, createModel, updateModel, deleteModel } from "./model.api";
import { modelColumns } from "./model.columns";
import ModelForm from "./ModelForm";
import ProductActionDialogs from "../../componenets/ProductActionDialogs"; // تأكد من مسار الملف الصحيح

export function ModelsList() {
  const queryClient = useQueryClient();

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  // =====================
  // Fetch models
  // =====================
  const { data: models = [], isLoading } = useQuery({
    queryKey: ["models"],
    queryFn: getModels,
  });

  // =====================
  // Create mutation
  // =====================
  const createMutation = useMutation({
    mutationFn: createModel,
    onSuccess: () => {
      queryClient.invalidateQueries(["models"]);
      setOpenFormDialog(false);
    },
  });

  // =====================
  // Update mutation
  // =====================
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateModel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["models"]);
      setOpenFormDialog(false);
      setSelectedModel(null);
    },
  });

  // =====================
  // Delete mutation
  // =====================
  const deleteMutation = useMutation({
    mutationFn: deleteModel,
    onSuccess: () => {
      queryClient.invalidateQueries(["models"]);
      setOpenDeleteDialog(false);
      setSelectedModel(null);
    },
  });

  // =====================
  // Handlers
  // =====================
  const handleAddClick = () => {
    setSelectedModel(null);
    setOpenFormDialog(true);
  };

  const handleEditClick = (model) => {
    setSelectedModel(model);
    setOpenFormDialog(true);
  };

  const handleDeleteClick = (model) => {
    setSelectedModel(model);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(selectedModel.id);
  };

  const handleFormSubmit = (data) => {
    const payload = {
      ...data,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
    };

    if (selectedModel) {
      updateMutation.mutate({ id: selectedModel.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Model</Typography>
        <Button variant="contained" onClick={handleAddClick} sx={{ mb: 2 }}>
          Add Model
        </Button>
      </Box>

      <DataGrid
        rows={models}
        columns={modelColumns(handleEditClick, handleDeleteClick)}
        loading={isLoading}
        autoHeight
        pageSize={10}
        sx={{
          width: "100%",
        }}
        showToolbar
        slots={{
          toolbar: GridToolbar,
        }}
      />
      <ScrollToTopButton />
      {/* Add / Edit Dialog */}
      <ModelForm
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        onSubmit={handleFormSubmit}
        defaultValues={selectedModel}
      />

      {/* Delete Dialog */}
      {/* <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Confirm</DialogTitle>

        <DialogContent>
          Are you sure you want to delete this model?{" "}
          <strong>{selectedModel?.name}</strong>
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
        // setOpenDeleteSelectedDialog={setOpenDeleteDialog}
        selectedIds={selectedModel?.id}
        handleDeleteSelected={handleDeleteClick}
        openDeleteDialog={openDeleteDialog}
        setOpenDeleteDialog={setOpenDeleteDialog}
        selectedProduct={selectedModel}
        handleDeleteConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
