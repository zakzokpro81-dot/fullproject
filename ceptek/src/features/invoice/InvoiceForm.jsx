import * as React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    MenuItem, Stack, Box, Autocomplete, Typography, Divider, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputAdornment
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoiceSchema } from "./invoice.schema";
import { createInvoiceAction } from "./invoice.api";
import { getAccounts } from "../accounts/account.api";
import supabase from "../../config/supabase";

export default function InvoiceForm({ open, onClose }) {
    const queryClient = useQueryClient();

    // 1. إعداد النموذج بنفس القيم الافتراضية المستقرة
    const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            customer_id: 7,
            account_id: 1,
            warehouse_id: "",
            items: [],
            paid_amount: 0
        }
    });

    // التحكم بمصفوفة المنتجات (السلة)
    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    const watchWarehouse = watch("warehouse_id");
    const watchAccount = watch("account_id");

    const watchItems = watch("items") || [];
    const subTotal = watchItems.reduce((acc, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unit_price) || 0;
        return acc + (qty * price);
    }, 0);

    const [errorDialogOpen, setErrorDialogOpen] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    // دالة لفتح مربع الخطأ بسهولة
    const showError = (message) => {
        setErrorMessage(message);
        setErrorDialogOpen(true);
    };
    // حساب الإجمالي الكلي من المصفوفة

    // 2. جلب البيانات بنفس المنطق الذي يعمل لديك
    const { data: accounts } = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });

    const { data: warehouses } = useQuery({
        queryKey: ["warehouses"],
        queryFn: async () => {
            const { data, error } = await supabase.from("warehouses").select("id, name");
            if (error) throw error;
            return data;
        }
    });

    const { data: customers } = useQuery({
        queryKey: ["customers"],
        queryFn: async () => {
            const { data } = await supabase.from("customers").select("id, name");
            return data;
        }
    });

    const { data: products } = useQuery({
        queryKey: ["productsForInvoice"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select("id, name, sku, sell_price")
                .eq("is_active", true);
            if (error) throw error;
            return data;
        }
    });

    // 3. منطق القيم الافتراضية للمخازن (نفس كودك الأصلي)
    React.useEffect(() => {
        if (warehouses && warehouses.length > 0 && !watchWarehouse) {
            setValue("warehouse_id", warehouses[0].id);
        }
    }, [warehouses, setValue, watchWarehouse]);

    // دالة إضافة منتج للسلة عند البحث أو الباركود
    const handleProductSelect = (product) => {
        if (!product) return;

        // التحقق إذا كان المنتج موجود مسبقاً لزيادة الكمية فقط (اختياري ولكن أفضل)
        const existingIndex = fields.findIndex(item => item.product_id === product.id);
        if (existingIndex > -1) {
            const currentQty = watch(`items.${existingIndex}.quantity`);
            setValue(`items.${existingIndex}.quantity`, Number(currentQty) + 1);
            return;
        }

        append({
            product_id: product.id,
            product_name: product.name,
            quantity: 1,
            unit_price: Number(product.sell_price) || 0,
            total: Number(product.sell_price) || 0
        });
    };
    const mutation = useMutation({
        mutationFn: createInvoiceAction,
        onSuccess: () => {
            queryClient.invalidateQueries(["invoices"]);
            onClose();
            reset();
        },
        onError: (err) => {
            // استبدال alert بمربع الحوار
            showError("Sale process failed: " + err.message);
        },
    });

  const onSubmit = (data) => {
  // مثال: فحص إذا كانت السلة فارغة
  if (data.items.length === 0) {
    showError("Your cart is empty. Please add at least one product.");
    return;
  }
  
  // إذا كان كل شيء تمام، نفذ الـ mutation
  mutation.mutate(data);
};




    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontWeight: 'bold' }}>New Multi-Item Sale</DialogTitle>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Stack spacing={3}>

                        {/* الحقول الأساسية مرتبة عمودياً */}
                        <TextField
                            select
                            fullWidth
                            label="Customer"
                            {...register("customer_id")}
                            defaultValue={7}
                            error={!!errors.customer_id}
                        >
                            {customers?.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            label="Warehouse"
                            value={watchWarehouse || ""}
                            {...register("warehouse_id")}
                            error={!!errors.warehouse_id}
                            SelectProps={{ displayEmpty: true }}
                        >
                            {warehouses?.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                        </TextField>

                        <Divider>Search & Scan Products</Divider>

                        <Autocomplete
                            options={products || []}
                            getOptionLabel={(option) => `${option.name} (${option.sku})`}
                            onChange={(_, val) => handleProductSelect(val)}
                            renderInput={(params) => (
                                <TextField {...params} label="Search Product or Scan Barcode" autoFocus
                                    InputProps={{ ...params.InputProps, startAdornment: <AddShoppingCartIcon color="primary" sx={{ mr: 1 }} /> }}
                                />
                            )}
                        />

                        {/* جدول المنتجات الديناميكي */}
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell align="center" width={100}>Qty</TableCell>
                                        <TableCell align="center" width={120}>Price</TableCell>
                                        <TableCell align="center" width={100}>Total</TableCell>
                                        <TableCell align="center" width={50}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell>{field.product_name}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    // إضافة { valueAsNumber: true } تضمن إرسالها كـ Number
                                                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                    onChange={(e) => {
                                                        const q = Number(e.target.value);
                                                        const p = watch(`items.${index}.unit_price`);
                                                        setValue(`items.${index}.total`, q * p);
                                                        // تحديث القيمة في الفورم كـ Number
                                                        setValue(`items.${index}.quantity`, q);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">{watch(`items.${index}.unit_price`)}</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                                {(watch(`items.${index}.quantity`) * watch(`items.${index}.unit_price`)).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => remove(index)} color="error"><DeleteIcon /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Divider>Payment Details</Divider>

                       <TextField
    select
    fullWidth
    label="Payment Account"
    // نستخدم القيمة المختارة أو القيمة الافتراضية 1
    value={watchAccount || 1}
    {...register("account_id")}
    error={!!errors.account_id}
>
    {accounts?.map((a) => (
        <MenuItem key={a.id} value={a.id}>
            {/* هنا قمنا بتنظيف الرقم ليظهر بخانتين عشريتين فقط */}
            {a.name} ({Number(a.balance).toFixed(2)})
        </MenuItem>
    ))}
</TextField>

                        <TextField label="Paid Amount" type="number" {...register("paid_amount")} fullWidth />

                        <Box sx={{ p: 2, bgcolor: "primary.light", color: "white", borderRadius: 2, textAlign: "center" }}>
                            <Typography variant="overline">Grand Total</Typography>
                            <Typography variant="h4" fontWeight="bold">${subTotal.toFixed(2)}</Typography>
                        </Box>

                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit">Cancel</Button>
                    <Button
                        type="submit"  // هذا السطر هو المحرك للـ form
                        variant="contained"
                        disabled={mutation.isPending}
                        sx={{ px: 6 }}
                    >
                        {mutation.isPending ? "Saving..." : "Confirm & Save"}
                       
                    </Button>
                </DialogActions>
            </Box>


              {/* Error Dialog Box */ }
    <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, px: 2 } }}
    >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
            Attention Needed
        </DialogTitle>
        <DialogContent>
            <Typography>{errorMessage}</Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2 }}>
            <Button
                onClick={() => setErrorDialogOpen(false)}
                variant="contained"
                color="error"
                fullWidth
            >
                Understood
            </Button>
        </DialogActions>
    </Dialog>


        </Dialog>



      

    );


    
}