// 5️⃣ BrandList.jsx

// 📌 الصفحة الرئيسية للبراند

// يجلب البيانات

// يعرض الجدول

// يفتح الفورم

// يتعامل مع الحذف

// هذا هو “المايسترو”

import { useState } from "react";
import { Box, Button, Typography, Paper, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GridToolbar } from "@mui/x-data-grid";
import { getBrands, createBrand, updateBrand, deleteBrand } from "./brand.api";
import { brandColumns } from "./brand.columns";
import BrandForm from "./BrandForm";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ScrollToTopButton from "../../componenets/ScrollToTopButton";
import ProductActionDialogs from "../../componenets/ProductActionDialogs"; // تأكد من مسار الملف الصحيح

export function BrandList() {
  const queryClient = useQueryClient();

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [mode, setMode] = useState("add");

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

  const handleDeleteClick = (brand) => {
    setSelectedBrand(brand);
    setOpenDelete(true);
  };

  const confirmDelete = () => {
    if (!selectedBrand) return;

    deleteMutation.mutate(selectedBrand.id);
    setOpenDelete(false);
    setSelectedBrand(null);
  };

  function BrandGridToolbar({ searchText, onSearchChange }) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Left: Search */}
        <TextField
          size="small"
          label="Search"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ width: 250 }}
        />

        {/* Right: DataGrid built-in options */}
        <GridToolbar />
      </Box>
    );
  }

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

      <Box display="flex">
        <DataGrid
          rows={brands}
          columns={brandColumns(handleOpenEdit, handleDeleteClick)}
          autoHeight
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          sx={{
            width: "100%",
          }}
          showToolbar
          slots={{
            toolbar: GridToolbar,
          }}
        />
      </Box>

      <BrandForm
        open={openForm}
        mode={mode}
        initialData={selectedBrand}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />

      <ScrollToTopButton />
      {/* <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>

        <DialogContent>
          هل أنت متأكد أنك تريد حذف البراند{" "}
          <strong>{selectedBrand?.name}</strong>؟
          <br />
          لا يمكن التراجع عن هذه العملية.
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmDelete}>
            Save
          </Button>
        </DialogActions>
      </Dialog> */}

      <ProductActionDialogs
        //openDeleteSelectedDialog={openDeleteDialog}
        //setOpenDeleteSelectedDialog={setOpenDelete}
        selectedIds={selectedBrand?.id}
        handleDeleteSelected={handleDeleteClick}
        openDeleteDialog={openDelete}
        setOpenDeleteDialog={setOpenDelete}
        selectedProduct={selectedBrand}
        handleDeleteConfirm={confirmDelete}
      />
    </Box>
  );
}
