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

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Dashboard />} />
      <Route path="/team" element={<Team />} />
      <Route path="/input" element={<Input />} />
      <Route path="/BrandList" element={<BrandList  />} />
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
