import React, { useState, useEffect } from "react";
import supabase from "../../config/supabase";
import { AddProductDialog } from "./AddProductDialog";
import { Button } from "@mui/material";

export function ProductsPage() {
  const [openAdd, setOpenAdd] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  // دالة جلب البيانات من قاعدة البيانات
  const fetchData = async () => {
    // 1. جلب المستودعات
    const { data: wData } = await supabase.from("warehouses").select("*");
    if (wData) setWarehouses(wData);

    // 2. جلب أنواع المنتجات
    const { data: tData } = await supabase.from("product_types").select("*");
    if (tData) setProductTypes(tData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Button variant="contained" onClick={() => setOpenAdd(true)}>
        إضافة منتج جديد
      </Button>

      {/* هنا نمرر البيانات للقائمة المنسدلة */}
      <AddProductDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        warehouses={warehouses} // تأكد من تمرير هذه
        productTypes={productTypes} // تأكد من تمرير هذه
      />
    </div>
  );
}
