import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Dashboard } from "./pages/dashboard/Dashboard";
import "./index.css";
import "./i18n";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import { Team } from "./pages/team/Team";
import { Input } from "./pages/input/Input";
import { BrandList } from "./features/brands/BrandList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FamilyList } from "./features/families/FamilyList";
import { ModelsList } from "./features/models/ModelsList";
import { ProductsList } from "./features/products/ProductList";
import { WarehouseList } from "./features/warehouses/WarehousesList";
import { WarehouseStockList } from "./features/WarehouseStock/WarehouseStockList";
import { BulkAddProducts } from "./features/products/BulkAddProducts";
import { CategoryList } from "./features/categories/CategoryList";
import { ProductTypeList } from "./features/Product Types/ProductTypeList";
import { ProductTypeAttributesList } from "./features/product type attributes/ProductTypeAttributesList";
import { AttributeOptionList } from "./features/attributeOption/AttributeOptionList";
import { AttributeList } from "./features/attributes/AttributeList";
import { CustomerList } from "./features/Customers/CustomerList";
import { CustomerTypeList } from "./features/customerTypes/CustomerTypeList";
import { PaymentList } from "./features/customerPayments/PaymentList";
import { InvoiceItemsList } from "./features/invoiceItem/InvoiceItemsList";
import { StockMovementList } from "./features/StockMovement/StockMovementList";
import { AccountList } from "./features/accounts/AccountList";
import { InvoiceList } from "./features/invoice/InvoiceList";
import { OrderList } from "./features/orders/OrderList";

// Employees & HR
import { DepartmentList } from "./features/departments/DepartmentList";
import { JobTitleList } from "./features/jobTitles/JobTitleList";
import { EmployeeList } from "./features/employees/EmployeeList";
import { RoleList } from "./features/roles/RoleList";
import { SalaryComponentList } from "./features/salaryComponents/SalaryComponentList";
import { PayrollList } from "./features/payroll/PayrollList";
import { EmployeeAdvanceList } from "./features/employeeAdvances/EmployeeAdvanceList";
import { AttendanceList } from "./features/attendance/AttendanceList";

// Suppliers & Purchases
import { SupplierTypeList } from "./features/supplierTypes/SupplierTypeList";
import { SupplierList } from "./features/suppliers/SupplierList";
import { PurchaseOrderList } from "./features/purchaseOrders/PurchaseOrderList";
import PurchaseInvoiceList from "./features/purchaseInvoices/PurchaseInvoiceList";
import SupplierPaymentList from "./features/supplierPayments/SupplierPaymentList";
import PurchaseReturnList from "./features/purchaseReturns/PurchaseReturnList";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Dashboard />} />
      <Route path="/team" element={<Team />} />
      <Route path="/input" element={<Input />} />
      <Route path="/brands" element={<BrandList />} />
      <Route path="/families" element={<FamilyList />} />
      <Route path="/models" element={<ModelsList />} />
      <Route path="/products" element={<ProductsList />} />
      <Route path="/warehouses" element={<WarehouseList />} />
      <Route path="/warehouse-stock" element={<WarehouseStockList />} />
      <Route path="/products/bulk-add" element={<BulkAddProducts />} />
      <Route path="/categories" element={<CategoryList />} />
      <Route path="/product-types" element={<ProductTypeList />} />
      <Route
        path="/product-type-attributes"
        element={<ProductTypeAttributesList />}
      />
      <Route path="/attribute-options" element={<AttributeOptionList />} />
      <Route path="/attributes" element={<AttributeList />} />
      <Route path="/customers" element={<CustomerList />} />
      <Route path="/customer-types" element={<CustomerTypeList />} />
      <Route path="/payments" element={<PaymentList />} />
      <Route path="/invoice-items" element={<InvoiceItemsList />} />
      <Route path="/stock-movements" element={<StockMovementList />} />
      <Route path="/accounts" element={<AccountList />} />
      <Route path="/invoices" element={<InvoiceList />} />
      <Route path="/orders" element={<OrderList />} />

      {/* Employees & HR */}
      <Route path="/departments" element={<DepartmentList />} />
      <Route path="/job-titles" element={<JobTitleList />} />
      <Route path="/employees" element={<EmployeeList />} />
      <Route path="/roles" element={<RoleList />} />
      <Route path="/salary-components" element={<SalaryComponentList />} />
      <Route path="/payroll" element={<PayrollList />} />
      <Route path="/employee-advances" element={<EmployeeAdvanceList />} />
      <Route path="/attendance" element={<AttendanceList />} />

      {/* Suppliers & Purchases */}
      <Route path="/supplier-types" element={<SupplierTypeList />} />
      <Route path="/suppliers" element={<SupplierList />} />
      <Route path="/purchase-orders" element={<PurchaseOrderList />} />
      <Route path="/purchase-invoices" element={<PurchaseInvoiceList />} />
      <Route path="/supplier-payments" element={<SupplierPaymentList />} />
      <Route path="/purchase-returns" element={<PurchaseReturnList />} />
    </Route>,
  ),
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
