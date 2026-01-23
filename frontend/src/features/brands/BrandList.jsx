// 5️⃣ BrandList.jsx

// 📌 الصفحة الرئيسية للبراند

// يجلب البيانات

// يعرض الجدول

// يفتح الفورم

// يتعامل مع الحذف

// هذا هو “المايسترو”

import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getBrands, createBrand, updateBrand, deleteBrand } from "./brand.api";
import { brandColumns } from "./brand.columns";
import BrandForm from "./BrandForm";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export function BrandList() {
  const queryClient = useQueryClient();

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [openForm, setOpenForm] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Fetch brands
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  // Create
  const createMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries(["brands"]);
      handleCloseForm();
    },
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["brands"]);
      handleCloseForm();
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries(["brands"]);
    },
  });

  const handleOpenAdd = () => {
    setMode("add");
    setSelectedBrand(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (brand) => {
    setMode("edit");
    setSelectedBrand(brand);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedBrand(null);
  };

  const handleSubmit = (data) => {
    if (mode === "add") {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate({
        id: selectedBrand.id,
        data,
      });
    }
  };

  // const handleDelete = (id) => {
  //   if (window.confirm("Are you sure you want to delete this brand?")) {
  //     deleteMutation.mutate(id);
  //   }
  // };

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenDelete(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(selectedId);

    setOpenDelete(false);
    setSelectedId(null);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Brands</Typography>
        <Button variant="contained" onClick={handleOpenAdd}>
          Add Brand
        </Button>
      </Box>

      <DataGrid
        rows={brands}
        columns={brandColumns(handleOpenEdit, handleDeleteClick)}
        autoHeight
        loading={isLoading}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
      />

      <BrandForm
        open={openForm}
        mode={mode}
        initialData={selectedBrand}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>

        <DialogContent>
          هل أنت متأكد أنك تريد حذف هذا البراند؟ لا يمكن التراجع عن هذه العملية.
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmDelete}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
