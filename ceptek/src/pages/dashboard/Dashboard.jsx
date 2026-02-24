import { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import { useQuery } from "@tanstack/react-query";
import supabase from "../../config/supabase";

async function getDashboardStats() {
  const [products, customers, invoices, warehouses] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("invoices").select("id", { count: "exact", head: true }),
    supabase.from("warehouses").select("id", { count: "exact", head: true }),
  ]);

  return {
    products: products.count || 0,
    customers: customers.count || 0,
    invoices: invoices.count || 0,
    warehouses: warehouses.count || 0,
  };
}

const statCards = [
  { key: "products", label: "Total Products", icon: InventoryIcon, color: "primary" },
  { key: "customers", label: "Total Customers", icon: PeopleIcon, color: "secondary" },
  { key: "invoices", label: "Total Invoices", icon: ReceiptIcon, color: "success" },
  { key: "warehouses", label: "Warehouses", icon: WarehouseIcon, color: "warning" },
];

export function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statCards.map(({ key, label, icon: Icon, color }) => (
          <Grid key={key} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Icon color={color} sx={{ fontSize: 48 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.[key] ?? 0}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
