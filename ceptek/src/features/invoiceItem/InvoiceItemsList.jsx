import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Stack, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { invoiceItemColumns } from "./invoiceItem.columns";
import InvoiceItemForm from "./InvoiceItemForm";

export function InvoiceItemsList({ items, onItemsChange }) {
  const { t } = useTranslation();
  const [openForm, setOpenForm] = useState(false);

  const handleDelete = (id) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = {
      ...newRow,
      total_price: Number(newRow.quantity) * Number(newRow.unit_price),
    };
    onItemsChange(
      items.map((item) => (item.id === newRow.id ? updatedRow : item)),
    );
    return updatedRow;
  };

  const handleAddItem = (newItemData) => {
    const formattedItem = {
      ...newItemData,
      id: `temp-${Date.now()}`,
      product_variants: {
        products: {
          name: newItemData.product_name,
        },
      },
    };
    onItemsChange([...items, formattedItem]);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">{t("invoiceFeature.entityPlural")}</Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          {t("common.addNew")}
        </Button>
      </Stack>

      <Box sx={{ height: 300, width: "100%", bgcolor: "background.paper" }}>
        <DataGrid
          rows={items}
          columns={invoiceItemColumns(handleDelete, t)}
          processRowUpdate={processRowUpdate}
          hideFooter
          disableRowSelectionOnClick
        />
      </Box>

      <InvoiceItemForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onAdd={handleAddItem}
      />
    </Box>
  );
}
