import * as React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { invoiceItemColumns } from "./invoiceItem.columns";
import InvoiceItemForm from "./InvoiceItemForm"; // استدعاء الفورم الفرعي

export function InvoiceItemsList({ items, onItemsChange }) {
  const [openForm, setOpenForm] = React.useState(false);

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
    // newItemData قادم من الفورم الفرعي
    const formattedItem = {
      ...newItemData,
      id: `temp-${Date.now()}`, // ضروري جداً لـ DataGrid
      // نركب الكائن يدوياً ليتناسب مع ما يطلبه ملف invoiceItem.columns.js
      product_variants: {
        products: {
          name: newItemData.product_name, // تأكد أن الفورم يرسل اسم المنتج أيضاً
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
        <Typography variant="h6">Invoice Items</Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Add Item
        </Button>
      </Stack>

      <Box sx={{ height: 300, width: "100%", bgcolor: "background.paper" }}>
        <DataGrid
          rows={items}
          columns={invoiceItemColumns(handleDelete)}
          processRowUpdate={processRowUpdate}
          hideFooter
          disableSelectionOnClick
        />
      </Box>

      {/* الفورم الذي سيفتح عند الضغط على زر الإضافة */}
      <InvoiceItemForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onAdd={handleAddItem}
      />
    </Box>
  );
}
