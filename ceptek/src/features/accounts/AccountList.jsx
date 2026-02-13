import * as React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "./account.api";
import { accountColumns } from "./account.columns";
import AccountForm from "./AccountForm";

export function AccountList() {
  const [openForm, setOpenForm] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Financial Accounts</Typography>
        <Button variant="contained" onClick={() => setOpenForm(true)}>
          Add Account
        </Button>
      </Box>
      <Paper sx={{ height: 400 }}>
        <DataGrid
          rows={data || []}
          columns={accountColumns}
          loading={isLoading}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick
        />
      </Paper>
      <AccountForm open={openForm} onClose={() => setOpenForm(false)} />
    </Box>
  );
}
