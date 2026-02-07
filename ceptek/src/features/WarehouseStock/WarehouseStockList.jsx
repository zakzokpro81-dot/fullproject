import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Button, Dialog } from "@mui/material";

import {
    fetchWarehouseStocks,
    createWarehouseStock,
    updateWarehouseStock,
    deleteWarehouseStock,
} from "./warehouseStock.api";
import { warehouseStockColumns } from "./warehouseStock.columns";
import { WarehouseStockForm } from "./WarehouseStockForm";

export function WarehouseStockList() {
    const queryClient = useQueryClient();

    // ✅ Query stocks
    const { data: stocks = [], isLoading } = useQuery({
        queryKey: ["warehouse_stock"],
        queryFn: fetchWarehouseStocks,
    });

    // ✅ Mutations
    const createMutation = useMutation({
        mutationFn: createWarehouseStock,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["warehouse_stock"] }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }) => updateWarehouseStock(id, payload),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["warehouse_stock"] }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteWarehouseStock,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["warehouse_stock"] }),
    });

    // Dialog & form state
    const [openForm, setOpenForm] = useState(false);
    const [editRow, setEditRow] = useState(null);

    const handleEdit = (row) => {
        setEditRow(row);
        setOpenForm(true);
    };

    const handleDelete = (row) => {
        if (
            window.confirm(
                `Delete stock of ${row.product_name} in ${row.warehouse_name}?`
            )
        ) {
            deleteMutation.mutate(row.id);
        }
    };

    const handleSave = (data) => {
        if (editRow) {
            updateMutation.mutate({ id: editRow.id, payload: data });
            setEditRow(null);
        } else {
            createMutation.mutate(data);
        }
        setOpenForm(false);
    };

    // Map rows for DataGrid
    const rows = stocks.map((item) => ({
        id: item.id,
        product_name: item.product_id?.name || "",
        warehouse_name: item.warehouse_id?.name || "",
        quantity: item.quantity,
        product_variant_id: item.product_variant_id?.id || null,
    }));

    return (
        <>
            <Button variant="contained" onClick={() => setOpenForm(true)}>
                Add Stock
            </Button>

            <Dialog
                open={openForm}
                onClose={() => setOpenForm(false)}
                fullWidth
                maxWidth="md"
            >
                <WarehouseStockForm onSave={handleSave} defaultValues={editRow} />
            </Dialog>

            <div style={{ height: 500, width: "100%", marginTop: 16 }}>
                <DataGrid
                    rows={rows}
                    columns={warehouseStockColumns(handleEdit, handleDelete)}
                    loading={isLoading}
                    components={{ Toolbar: GridToolbar }}
                    sx={{ width: "100%" }}
                    pageSizeOptions={[5, 10, 20, 50, 100]} // ✅ تم إضافة 100 لتجنب تحذير MUI
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                />
            </div>
        </>
    );
}
