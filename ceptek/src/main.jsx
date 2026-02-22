import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Dashboard } from "./pages/dashboard/Dashboard";
import "./index.css";
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
