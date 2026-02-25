import { useEffect, useState, Fragment } from "react";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import { styled, useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";

import {
  HomeOutlined,
  PeopleOutline,
  ContactsOutlined,
  ReceiptOutlined,
  ExpandLess,
  ExpandMore,
  Inventory2Outlined,
  AddBoxOutlined,
  WarehouseOutlined,
  HistoryOutlined,
  AccountBalanceOutlined,
  GroupOutlined,
  CategoryOutlined,
  ShoppingCartOutlined,
  LabelOutlined,
  TuneOutlined,
  ListAltOutlined,
  ViewListOutlined,
  ClassOutlined,
  PaymentOutlined,
  DescriptionOutlined,
  ReceiptLongOutlined,
  LocalShippingOutlined,
  BadgeOutlined,
  BusinessOutlined,
  WorkOutlineOutlined,
  SecurityOutlined,
  MonetizationOnOutlined,
  AccountBalanceWalletOutlined,
  SavingsOutlined,
  EventAvailableOutlined,
  StorefrontOutlined,
  LocalAtmOutlined,
  AssignmentReturnOutlined,
} from "@mui/icons-material";

import { Avatar, Tooltip, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

// ================= MENU STRUCTURE =================

const getMenuGroups = (t) => [
  {
    id: "products",
    title: t("sidebar.productsStock"),
    color: "#ed6c02",
    icon: <Inventory2Outlined />,
    children: [
      { text: t("sidebar.products"), path: "/products", icon: <Inventory2Outlined /> },
      { text: t("sidebar.bulkImport"), path: "/products/bulk-add", icon: <AddBoxOutlined /> },
      { text: t("sidebar.stockLevels"), path: "/warehouse-stock", icon: <WarehouseOutlined /> },
      { text: t("sidebar.stockHistory"), path: "/stock-movements", icon: <HistoryOutlined /> },
    ],
  },
  {
    id: "accounts",
    title: t("sidebar.accountsCustomers"),
    color: "#1976d2",
    icon: <AccountBalanceOutlined />,
    children: [
      { text: t("sidebar.accounts"), path: "/accounts", icon: <AccountBalanceOutlined /> },
      { text: t("sidebar.customers"), path: "/customers", icon: <PeopleOutline /> },
      { text: t("sidebar.customerTypes"), path: "/customer-types", icon: <GroupOutlined /> },
      { text: t("sidebar.invoices"), path: "/invoices", icon: <DescriptionOutlined /> },
      { text: t("sidebar.invoiceItems"), path: "/invoice-items", icon: <ReceiptLongOutlined /> },
      { text: t("sidebar.payments"), path: "/payments", icon: <PaymentOutlined /> },
    ],
  },
  {
    id: "orders",
    title: t("sidebar.orders"),
    color: "#2e7d32",
    icon: <ShoppingCartOutlined />,
    children: [
      { text: t("sidebar.orderList"), path: "/orders", icon: <LocalShippingOutlined /> },
    ],
  },
  {
    id: "catalog",
    title: t("sidebar.catalogSettings"),
    color: "#9c27b0",
    icon: <CategoryOutlined />,
    children: [
      { text: t("sidebar.brands"), path: "/brands", icon: <LabelOutlined /> },
      { text: t("sidebar.families"), path: "/families", icon: <ClassOutlined /> },
      { text: t("sidebar.models"), path: "/models", icon: <ViewListOutlined /> },
      { text: t("sidebar.warehouses"), path: "/warehouses", icon: <WarehouseOutlined /> },
      { text: t("sidebar.attributes"), path: "/attributes", icon: <TuneOutlined /> },
      { text: t("sidebar.attributeOptions"), path: "/attribute-options", icon: <ListAltOutlined /> },
      { text: t("sidebar.productTypes"), path: "/product-types", icon: <CategoryOutlined /> },
      { text: t("sidebar.categories"), path: "/categories", icon: <ClassOutlined /> },
    ],
  },
  {
    id: "employees",
    title: t("sidebar.employeesHR"),
    color: "#0288d1",
    icon: <BadgeOutlined />,
    children: [
      { text: t("sidebar.departments"), path: "/departments", icon: <BusinessOutlined /> },
      { text: t("sidebar.jobTitles"), path: "/job-titles", icon: <WorkOutlineOutlined /> },
      { text: t("sidebar.employees"), path: "/employees", icon: <PeopleOutline /> },
      { text: t("sidebar.roles"), path: "/roles", icon: <SecurityOutlined /> },
      { text: t("sidebar.salaryComponents"), path: "/salary-components", icon: <MonetizationOnOutlined /> },
      { text: t("sidebar.payroll"), path: "/payroll", icon: <AccountBalanceWalletOutlined /> },
      { text: t("sidebar.advances"), path: "/employee-advances", icon: <SavingsOutlined /> },
      { text: t("sidebar.attendance"), path: "/attendance", icon: <EventAvailableOutlined /> },
    ],
  },
  {
    id: "suppliers",
    title: t("sidebar.suppliersPurchases"),
    color: "#d32f2f",
    icon: <StorefrontOutlined />,
    children: [
      { text: t("sidebar.supplierTypes"), path: "/supplier-types", icon: <GroupOutlined /> },
      { text: t("sidebar.suppliers"), path: "/suppliers", icon: <StorefrontOutlined /> },
      { text: t("sidebar.purchaseOrders"), path: "/purchase-orders", icon: <ShoppingCartOutlined /> },
      { text: t("sidebar.purchaseInvoices"), path: "/purchase-invoices", icon: <DescriptionOutlined /> },
      { text: t("sidebar.supplierPayments"), path: "/supplier-payments", icon: <LocalAtmOutlined /> },
      { text: t("sidebar.purchaseReturns"), path: "/purchase-returns", icon: <AssignmentReturnOutlined /> },
    ],
  },
];

// ================= COMPONENT =================

export function SideBar({ open, handleDrawerClose }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [openGroups, setOpenGroups] = useState({});
  const [hoverOpen, setHoverOpen] = useState(false);

  const isDrawerOpen = open || hoverOpen;
  const menuGroups = getMenuGroups(t);

  // Auto-expand group matching current route
  useEffect(() => {
    const newOpenGroups = {};

    menuGroups.forEach((group) => {
      const match = group.children.some(
        (item) => item.path === location.pathname,
      );
      if (match) {
        newOpenGroups[group.id] = true;
      }
    });

    setOpenGroups((prev) => ({ ...prev, ...newOpenGroups }));
  }, [location.pathname]);

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Drawer
      variant="permanent"
      open={isDrawerOpen}
      onMouseEnter={() => setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
    >
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "rtl" ? (
            <ChevronRightIcon />
          ) : (
            <ChevronLeftIcon />
          )}
        </IconButton>
      </DrawerHeader>

      <Avatar
        sx={{
          mx: "auto",
          width: isDrawerOpen ? "88px" : "44px",
          height: isDrawerOpen ? "88px" : "44px",
          transition: "0.25s",
          border: "2px solid #1976d2",
          my: 1,
        }}
        src="/images/zek.jpeg"
      />

      <Typography align="center" sx={{ fontSize: isDrawerOpen ? "17px" : 0 }}>
        {t("common.appName")}
      </Typography>
      <Typography
        align="center"
        sx={{
          fontSize: isDrawerOpen ? "14px" : 0,
          color: theme.palette.info.main,
        }}
      >
        {t("common.admin")}
      </Typography>

      <Divider sx={{ my: 1 }} />
      <List>
        {menuGroups.map((group) => {
          const isOpen = !!openGroups[group.id];

          return (
            <Fragment key={group.id}>
              <Tooltip
                title={isDrawerOpen ? "" : group.title}
                placement="right"
              >
                <ListItem disablePadding sx={{ display: "block" }}>
                  <ListItemButton
                    onClick={() => toggleGroup(group.id)}
                    sx={{
                      minHeight: 52,
                      mx: 1,
                      my: 0.7,
                      borderRadius: 2,
                      justifyContent: isDrawerOpen ? "initial" : "center",

                      bgcolor: isOpen ? group.color : `${group.color}22`,
                      color: isOpen ? "#fff" : group.color,

                      boxShadow: isOpen
                        ? "0 0 10px rgba(0,0,0,0.25)"
                        : "0 0 4px rgba(0,0,0,0.15)",

                      transition: "all 0.25s ease",

                      "&:hover": {
                        bgcolor: group.color,
                        color: "#fff",
                        transform: theme.direction === "rtl" ? "translateX(-4px)" : "translateX(4px)",
                        boxShadow: "0 0 15px rgba(0,0,0,0.35)",
                        backgroundImage:
                          "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0))",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: isDrawerOpen ? 2 : "auto",
                        justifyContent: "center",
                        color: "inherit",
                      }}
                    >
                      {group.icon}
                    </ListItemIcon>

                    <ListItemText
                      primary={group.title}
                      sx={{
                        opacity: isDrawerOpen ? 1 : 0,
                        fontWeight: "bold",
                        letterSpacing: "0.5px",
                      }}
                    />

                    {isDrawerOpen && (isOpen ? <ExpandLess /> : <ExpandMore />)}
                  </ListItemButton>
                </ListItem>
              </Tooltip>

              <Collapse in={isOpen && isDrawerOpen} timeout="auto">
                <List component="div" disablePadding>
                  {group.children.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                      <ListItem key={item.text} disablePadding>
                        <ListItemButton
                          onClick={() => navigate(item.path)}
                          sx={{
                            pl: 6,
                            mx: 1,
                            my: 0.4,
                            borderRadius: 2,

                            bgcolor: isActive
                              ? `${group.color}cc`
                              : "transparent",

                            color: isActive
                              ? "#fff"
                              : theme.palette.text.secondary,

                            transition: "all 0.2s ease",

                            "&:hover": {
                              bgcolor: `${group.color}aa`,
                              color: "#fff",
                              transform: theme.direction === "rtl" ? "translateX(-6px)" : "translateX(6px)",
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 32,
                              color: "inherit",
                            }}
                          >
                            {item.icon}
                          </ListItemIcon>

                          <ListItemText
                            primary={item.text}
                            sx={{ fontSize: "0.9rem" }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>

              <Divider sx={{ my: 1, opacity: 0.3 }} />
            </Fragment>
          );
        })}
      </List>
    </Drawer>
  );
}
