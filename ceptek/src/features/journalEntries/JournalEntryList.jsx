import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  TextField,
  Paper,
  MenuItem,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

import { useTranslation } from "react-i18next";
import {
  useJournalEntryQuery,
  useJournalEntryMutations,
  useJournalAccounts,
} from "./journalEntry.hooks";
import { journalEntryColumns } from "./journalEntry.columns";
import { TRANSACTION_TYPES } from "./journalEntry.schema";
import JournalEntryForm from "./JournalEntryForm";
import JournalEntryDetailsDrawer from "./JournalEntryDetailsDrawer";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { useMessageDialog } from "../../hooks/useMessageDialog";

export function JournalEntryList() {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [drawerEntry, setDrawerEntry] = useState(null);
  const [mode, setMode] = useState("add");

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  function handleCloseForm() {
    setOpenForm(false);
    setSelectedItem(null);
  }

  const { messageDialog, showMessageDialog, closeMessageDialog } =
    useMessageDialog();

  const { data: accounts = [] } = useJournalAccounts();

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
  } = useJournalEntryQuery({
    transactionType: typeFilter,
    dateFrom,
    dateTo,
  });

  const { createMutation, updateMutation, deleteMutation, postMutation } =
    useJournalEntryMutations({
      onSuccess: handleCloseForm,
      showMessageDialog,
    });

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
    if (mode === "add") {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate({ id: selectedItem.id, data });
    }
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

  const handlePostEntry = (row) => {
    postMutation.mutate(row.id);
  };

  const handleViewEntry = (row) => {
    setDrawerEntry(row);
  };

  const handlePaginationChange = (newModel) => {
    setPaginationModel(newModel);
  };

  const clearFilters = () => {
    setTypeFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const hasFilters = typeFilter || dateFrom || dateTo;
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    postMutation.isPending;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">{t("journalFeature.title")}</Typography>
        <Button variant="contained" onClick={handleOpenAdd}>
          {t("journalFeature.addEntry")}
        </Button>
      </Box>

      {/* Filters */}
      <Stack
        direction="row"
        spacing={2}
        mb={2}
        alignItems="center"
        flexWrap="wrap"
      >
        <TextField
          label={t("common.search")}
          variant="outlined"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ maxWidth: 300, flex: 1 }}
        />
        <TextField
          select
          label={t("journalFeature.transactionType")}
          size="small"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">{t("journalFeature.allTypes")}</MenuItem>
          {TRANSACTION_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {t(`journalFeature.type_${type}`)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label={t("journalFeature.dateFrom")}
          type="date"
          size="small"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 160 }}
        />
        <TextField
          label={t("journalFeature.dateTo")}
          type="date"
          size="small"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 160 }}
        />
        {hasFilters && (
          <Button
            size="small"
            startIcon={<FilterAltOffIcon />}
            onClick={clearFilters}
          >
            {t("journalFeature.clearFilters")}
          </Button>
        )}
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("common.failedToLoad", {
            error: error?.message || t("common.unknownError"),
          })}
        </Alert>
      )}

      <Paper sx={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={rows}
          rowCount={rowCount}
          columns={journalEntryColumns(
            handleOpenEdit,
            handleDeleteClick,
            handlePostEntry,
            handleViewEntry,
            t,
          )}
          loading={isLoading || isFetching || isMutating}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{ width: "100%" }}
        />
      </Paper>

      <JournalEntryForm
        open={openForm}
        mode={mode}
        initialData={selectedItem}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        accounts={accounts}
      />

      <ConfirmDeleteDialog
        open={openDelete}
        itemName={selectedItem?.entry_number || ""}
        onClose={() => {
          setOpenDelete(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />

      {/* Details Drawer */}
      <JournalEntryDetailsDrawer
        entry={drawerEntry}
        onClose={() => setDrawerEntry(null)}
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
