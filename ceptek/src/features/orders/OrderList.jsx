import { useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";

import { orderColumns } from "./order.columns";
import OrderForm from "./OrderForm";
import OrderDetailsDrawer from "./OrderDetailsDrawer";
import {
  useOrderQuery,
  useOrderFormOptions,
  useOrderMutations,
} from "./order.hooks";
import { useMessageDialog } from "../../hooks/useMessageDialog";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";

export function OrderList() {
  const { t } = useTranslation();
  const [openForm, setOpenForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [warehouseId, setWarehouseId] = useState(null);

  const { messageDialog, showMessageDialog, closeMessageDialog } =
    useMessageDialog();

  const { rows, isLoading } = useOrderQuery();
  const { customers, warehouses, products, loadingProducts } =
    useOrderFormOptions(warehouseId);

  const { createMutation, confirmMutation } = useOrderMutations({
    onSuccess: () => setOpenForm(false),
    showMessageDialog,
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          {t("ordersFeature.title")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          {t("common.addNew", { item: t("ordersFeature.entity") })}
        </Button>
      </Box>

      {/* Grid */}
      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={orderColumns(t)}
          loading={isLoading}
          pageSizeOptions={[10, 20]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          onRowClick={(params) => setSelectedOrder(params.row)}
          disableRowSelectionOnClick
        />
      </Paper>

      <OrderForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
        customers={customers}
        warehouses={warehouses}
        products={products}
        loadingProducts={loadingProducts}
      />

      <OrderDetailsDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        confirmMutation={confirmMutation}
      />

      <MessageDialog {...messageDialog} onClose={closeMessageDialog} />
      <ScrollToTopButton />
    </Box>
  );
}
