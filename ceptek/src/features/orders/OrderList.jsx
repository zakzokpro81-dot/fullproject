import * as React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "./order.api";
import { orderColumns } from "./order.columns";
import OrderForm from "./OrderForm";
import OrderDetailsDrawer from "./OrderDetailsDrawer"; // Import the separate drawer file

export function OrderList() {
  const [openForm, setOpenForm] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2c3e50" }}>
          Sales Orders Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Create New Order
        </Button>
      </Box>

      {/* Main Grid Section */}
      <Paper sx={{ height: 600, width: "100%", boxShadow: 3 }}>
        <DataGrid
          rows={data || []}
          columns={orderColumns}
          loading={isLoading}
          pageSizeOptions={[10, 20]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          // Logic to open Drawer when clicking anywhere on the row
          onRowClick={(params) => setSelectedOrder(params.row)}
          sx={{
            cursor: "pointer",
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        />
      </Paper>

      {/* Form Dialog for Creating New Orders */}
      <OrderForm open={openForm} onClose={() => setOpenForm(false)} />

      {/* Separate Drawer for Viewing Order Details */}
      <OrderDetailsDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </Box>
  );
}
