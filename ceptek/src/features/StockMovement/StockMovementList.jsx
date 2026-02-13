import * as React from "react";
import { Box, Paper, Typography, Button, Stack, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import AddIcon from "@mui/icons-material/Add";
import { getStockMovements } from "./stockMovement.api";
import { stockMovementColumns } from "./stockMovement.columns";
import StockMovementForm from "./StockMovementForm";

export function StockMovementList() {
  const [openForm, setOpenForm] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });

  const { data, isLoading } = useQuery({
    queryKey: ["stockMovements", paginationModel, searchText],
    queryFn: () => getStockMovements({ page: paginationModel.page, pageSize: paginationModel.pageSize, searchText }),
  });

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Stock Movements</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenForm(true)}>
          New Movement
        </Button>
      </Stack>

      <TextField 
        fullWidth label="Search by Product Name" 
        sx={{ mb: 2 }} 
        onChange={(e) => setSearchText(e.target.value)} 
      />

      <Paper sx={{ height: 500 }}>
        <DataGrid
          rows={data?.data || []}
          rowCount={data?.count || 0}
          columns={stockMovementColumns}
          loading={isLoading}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Paper>

      {openForm && <StockMovementForm open={openForm} onClose={() => setOpenForm(false)} />}
    </Box>
  );
}