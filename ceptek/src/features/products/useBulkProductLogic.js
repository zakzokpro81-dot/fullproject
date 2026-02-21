
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Autocomplete,
  Container,
  Stack,
  IconButton,
  InputAdornment,
  Grid,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import {
  getCategories,
  getProductTypes,
  getWarehouses,
  getAttributes,
  saveBulkProducts,
} from "./product.api";
import { BulkModelAutocomplete } from "./BulkModelAutocomplete";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import InventoryIcon from "@mui/icons-material/Inventory";
import BulkProductTable from "./BulkProductTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductActionDialogs from "../../componenets/ProductActionDialogs"; // تأكد من مسار الملف الصحيح
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { ModelAutocomplete } from "./ModelAutocomplete";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";


export  function useBulkProductLogic(){
  const [unitsList, setUnitsList] = useState([{ imei: "", serial_number: "" }]);

  // تحديث الصفوف في الجدول تلقائياً عند تغيير قائمة الـ IMEI/Serial في الحقول العلوية
  useEffect(() => {
    if (watchedProductType?.tracking_type_id === 3 && rows.length > 0) {
      setRows((prevRows) => {
        return prevRows.map((row, index) => {
          // إذا كان هناك بيانات مقابلة لهذا الصف في قائمة الوحدات العلوية
          if (unitsList[index]) {
            const updatedRow = { ...row };
            const manuallyEdited = row.manuallyEditedFields || [];

            // لا تحدث الـ IMEI إذا كان المستخدم قد عدله يدوياً في الجدول (محمي)
            if (!manuallyEdited.includes("imei")) {
              updatedRow.imei = unitsList[index].imei;
            }

            // لا تحدث الـ Serial إذا كان محمي يدوياً
            if (!manuallyEdited.includes("serial_number")) {
              updatedRow.serial_number = unitsList[index].serial_number;
            }

            return updatedRow;
          }
          return row;
        });
      });
    }
  }, [unitsList, watchedProductType?.tracking_type_id]);



      // دالة لإضافة سطر جديد
  const addUnitField = () => {
    // 1. إضافة حقل فارغ في القائمة العلوية
    setUnitsList((prev) => [...prev, { imei: "", serial_number: "" }]);
    // 2. إذا كان هناك أصلاً منتجات في الجدول، نأخذ أول سطر كـ "نموذج" ونضيف سطر جديد مثله
    if (rows.length > 0) {
      const templateRow = rows[0]; // نأخذ معلومات الموديل والسعر والبراند من أول سطر
      const newBlankRow = {
        ...templateRow,
        id: Math.random().toString(36).substr(2, 9), // آيدي جديد فريد
        imei: "",
        serial_number: "",
        manuallyEditedFields: [],
      };
      setRows((prevRows) => [...prevRows, newBlankRow]);
    }
  };

  // دالة لتحديث قيمة حقل معين
  const updateUnitField = (index, field, value) => {
    const newUnits = [...unitsList];
    newUnits[index][field] = value;
    setUnitsList(newUnits);
  };

  // دالة لحذف سطر
  const removeUnitField = (index) => {
    // حذف من القائمة العلوية
    const updatedUnits = unitsList.filter((_, i) => i !== index);
    setUnitsList(updatedUnits);

    // حذف السطر المقابل له من الجدول
    setRows((prevRows) => prevRows.filter((_, i) => i !== index));
  };

  const ACCORDION_STYLE = {
    borderRadius: "8px !important",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
    "&:before": { display: "none" }, // لإخفاء الخط الافتراضي بين الأكورديونات
  };



  const applySpecificFieldToRow = (index, fieldName) => {
    const valueFromTop = unitsList[index]?.[fieldName] || "";

    setRows((prev) => {
      const newRows = [...prev];
      if (newRows[index]) {
        newRows[index] = {
          ...newRows[index],
          [fieldName]: valueFromTop,
          // حذف الحماية عن هذا الحقل في هذا الصف تحديداً
          manuallyEditedFields: (
            newRows[index].manuallyEditedFields || []
          ).filter((f) => f !== fieldName),
        };
      }
      return newRows;
    });
  };




    return {

    }
}