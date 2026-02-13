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
import { Router } from "@mui/icons-material";
import App from "./App";
import { Team } from "./pages/team/Team";
import { Input } from "./pages/input/Input";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { BrandList } from "../src/features/brands/BrandList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FamilyList } from "../src/features/families/FamilyList";
import { ModelsList } from "../src/features/models/ModelsList";
import { ProductsList } from "../src/features/products/ProductList";
import { WarehousesList } from "../src/features/warehouses/WarehousesList";
import { WarehouseStockList } from "../src/features/WarehouseStock/WarehouseStockList";
import { BulkProductCreate } from "../src/features/products/BulkProductCreate";
import { BulkAddProducts } from "../src/features/products/BulkAddProducts";
import { CategoryList } from "../src/features/categories/CategoryList";
import { ProductTypeList } from "../src/features/Product Types/ProductTypeList";
import { ProductTypeAttributesList } from "../src/features/product type attributes/ProductTypeAttributesList";
import { AttributeOptionList } from "./features/attributeOption/AttributeOptionList";
import { AttributeList } from "../src/features/attributes/AttributeList";
import { CustomerList } from "../src/features/Customers/CustomerList";
import { CustomerTypeList } from "../src/features/customerTypes/CustomerTypeList";
import { PaymentList } from "../src/features/customerPayments/PaymentList";
import { InvoicesList } from "./features/invoices/InvoicesList";
import { InvoiceItemsList } from "../src/features/invoiceItem/InvoiceItemsList";
import { StockMovementList } from "./features/StockMovement/StockMovementList";
import { AccountList } from "./features/accounts/AccountList";
import { InvoiceList } from "./features/invoice/InvoiceList";
const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Dashboard />} />
      <Route path="/team" element={<Team />} />
      <Route path="/input" element={<Input />} />
      <Route path="/BrandList" element={<BrandList />} />
      <Route path="/FamilyList" element={<FamilyList />} />
      <Route path="/ModelsList" element={<ModelsList />} />
      <Route path="/ProductsList" element={<ProductsList />} />
      <Route path="/WarehousesList" element={<WarehousesList />} />
      <Route path="/WarehouseStockList" element={<WarehouseStockList />} />
      <Route path="/BulkProductCreate" element={<BulkProductCreate />} />
      <Route path="/BulkAddProducts" element={<BulkAddProducts />} />
      <Route path="/CategoryList" element={<CategoryList />} />
      <Route path="/ProductTypeList" element={<ProductTypeList />} />
      <Route
        path="/ProductTypeAttributesList"
        element={<ProductTypeAttributesList />}
      />
      <Route path="/AttributeOptionList" element={<AttributeOptionList />} />
      <Route path="/AttributeList" element={<AttributeList />} />
      <Route path="/CustomerList" element={<CustomerList />} />
      <Route path="/CustomerTypeList" element={<CustomerTypeList />} />
      <Route path="/PaymentList" element={<PaymentList />} />
      <Route path="/InvoiceItemsList" element={<InvoiceItemsList />} />
      <Route path="/InvoiceItemsList" element={<InvoiceItemsList />} />
      <Route path="/StockMovementList" element={<StockMovementList />} />
      <Route path="/AccountList" element={<AccountList />} />
      <Route path="/InvoiceList" element={<InvoiceList />} />
    </Route>,
  ),
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
);
