import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";

import { getStockMovementColumns } from "./stockMovement.columns";
import StockMovementForm from "./StockMovementForm";
import {
  useStockMovementQuery,
  useStockMovementMutations,
  useStockMovementFormOptions,
} from "./stockMovement.hooks";
import { useMessageDialog } from "../../hooks/useMessageDialog";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";

export function StockMovementList() {
  const { t } = useTranslation();
  const {
    rows,
    rowCount,
    isLoading,
    isFetching,
    paginationModel,
    setPaginationModel,
    searchText,
    setSearchText,
  } = useStockMovementQuery();

  const { movementTypes, warehouses, products } = useStockMovementFormOptions();
  const [openForm, setOpenForm] = useState(false);
  const { messageDialog, showMessageDialog } = useMessageDialog();

  const { createMutation } = useStockMovementMutations({
    onSuccess: () => setOpenForm(false),
    showMessageDialog,
  });

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h5" fontWeight="bold">
            {t("stockMovements.title")}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
          >
            {t("common.addNew")}
          </Button>
        </Stack>

        <TextField
          fullWidth
          label={t("stockMovements.searchByProduct")}
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Paper>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          rowCount={rowCount}
          columns={getStockMovementColumns(t)}
          loading={isLoading || isFetching}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
        />
      </Paper>

      <MessageDialog
        open={messageDialog.open}
        onClose={messageDialog.onClose}
        title={messageDialog.title}
        message={messageDialog.message}
        type={messageDialog.type}
      />

      {openForm && (
        <StockMovementForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isPending={createMutation.isPending}
          products={products}
          warehouses={warehouses}
          movementTypes={movementTypes}
        />
      )}

      <ScrollToTopButton />
    </Box>
  );
}
