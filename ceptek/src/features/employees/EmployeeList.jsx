import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Typography,
  Alert,
  TextField,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  useEmployeeQuery,
  useEmployeeMutations,
  useEmployeeFormOptions,
} from "./employee.hooks";
import { employeeColumns } from "./employee.columns";
import EmployeeForm from "./EmployeeForm";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { useMessageDialog } from "../../hooks/useMessageDialog";

export function EmployeeList() {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDeleteSelected, setOpenDeleteSelected] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [mode, setMode] = useState("add");

  function handleCloseForm() {
    setOpenForm(false);
    setSelectedItem(null);
  }

  const { messageDialog, showMessageDialog, closeMessageDialog } =
    useMessageDialog();
  const {
    rows,
    rowCount,
    isLoading,
    isFetching,
    isError,
    error,
    paginationModel,
    setPaginationModel,
    searchText,
    setSearchText,
  } = useEmployeeQuery();
  const {
    createMutation,
    updateMutation,
    deleteMutation,
    deleteMultipleMutation,
  } = useEmployeeMutations({ onSuccess: handleCloseForm, showMessageDialog });
  const { departments, jobTitles } = useEmployeeFormOptions();

  const handleOpenAdd = () => {
    setMode("add");
    setSelectedItem(null);
    setOpenForm(true);
  };
  const handleOpenEdit = (row) => {
    setMode("edit");
    setSelectedItem(row);
    setOpenForm(true);
  };
  const handleFormSubmit = (data) => {
    const clean = { ...data };
    if (!clean.email) delete clean.email;
    if (!clean.end_date) delete clean.end_date;
    mode === "add"
      ? createMutation.mutate(clean)
      : updateMutation.mutate({ id: selectedItem.id, data: clean });
  };
  const handleDeleteClick = (row) => {
    setSelectedItem(row);
    setOpenDelete(true);
  };
  const handleDeleteConfirm = () => {
    if (!selectedItem) return;
    deleteMutation.mutate(selectedItem.id, {
      onSettled: () => {
        setOpenDelete(false);
        setSelectedItem(null);
      },
    });
  };
  const handlePaginationChange = (m) => {
    setSelectedIds(new Set());
    setPaginationModel(m);
  };
  const toggleSelectAll = () => {
    const all = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
    setSelectedIds(all ? new Set() : new Set(rows.map((r) => r.id)));
  };
  const toggleSelect = (id) => {
    const s = new Set(selectedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedIds(s);
  };
  const handleDeleteSelectedConfirm = () => {
    if (selectedIds.size === 0) return;
    deleteMultipleMutation.mutate(Array.from(selectedIds), {
      onSettled: () => {
        setOpenDeleteSelected(false);
        setSelectedIds(new Set());
      },
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">{t("employees.title")}</Typography>
        <Box display="flex" gap={1}>
          {selectedIds.size > 0 && (
            <Button
              variant="contained"
              color="error"
              onClick={() => setOpenDeleteSelected(true)}
            >
              {t("common.deleteSelected")} ({selectedIds.size})
            </Button>
          )}
          <Button variant="contained" onClick={handleOpenAdd}>
            {t("common.addNew")}
          </Button>
        </Box>
      </Box>
      <Box mb={2}>
        <TextField
          label={t("common.search")}
          variant="outlined"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          fullWidth
          sx={{ maxWidth: 400 }}
        />
      </Box>
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("common.failedToLoad")}: {error?.message || t("common.unknownError")}
        </Alert>
      )}
      <Paper sx={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={rows}
          rowCount={rowCount}
          columns={employeeColumns(
            handleOpenEdit,
            handleDeleteClick,
            selectedIds,
            toggleSelect,
            rows,
            toggleSelectAll,
            t,
          )}
          loading={isLoading || isFetching}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{ width: "100%" }}
        />
      </Paper>
      <EmployeeForm
        open={openForm}
        mode={mode}
        initialData={selectedItem}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        departments={departments}
        jobTitles={jobTitles}
      />
      <ConfirmDeleteDialog
        open={openDelete}
        itemName={`${selectedItem?.first_name || ""} ${selectedItem?.last_name || ""}`}
        onClose={() => {
          setOpenDelete(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
      <ConfirmDeleteDialog
        open={openDeleteSelected}
        itemName={`${selectedIds.size} ${t("common.selectedItems")}`}
        onClose={() => setOpenDeleteSelected(false)}
        onConfirm={handleDeleteSelectedConfirm}
        isPending={deleteMultipleMutation.isPending}
      />
      <MessageDialog
        open={messageDialog.open}
        title={messageDialog.title}
        message={messageDialog.message}
        severity={messageDialog.severity}
        onClose={closeMessageDialog}
      />
      <ScrollToTopButton />
    </Box>
  );
}
