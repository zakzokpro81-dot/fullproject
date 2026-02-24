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
} from "@mui/icons-material";

import { Avatar, Tooltip, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

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

const menuGroups = [
  {
    id: "products",
    title: "Products & Stock",
    color: "#ed6c02",
    icon: <Inventory2Outlined />,
    children: [
      { text: "Products", path: "/products", icon: <Inventory2Outlined /> },
      {
        text: "Bulk Import",
        path: "/products/bulk-add",
        icon: <AddBoxOutlined />,
      },
      {
        text: "Stock Levels",
        path: "/warehouse-stock",
        icon: <WarehouseOutlined />,
      },
      {
        text: "Stock History",
        path: "/stock-movements",
        icon: <HistoryOutlined />,
      },
    ],
  },
  {
    id: "accounts",
    title: "Accounts & Customers",
    color: "#1976d2",
    icon: <AccountBalanceOutlined />,
    children: [
      { text: "Accounts", path: "/accounts", icon: <AccountBalanceOutlined /> },
      { text: "Customers", path: "/customers", icon: <PeopleOutline /> },
      {
        text: "Customer Types",
        path: "/customer-types",
        icon: <GroupOutlined />,
      },
      { text: "Invoices", path: "/invoices", icon: <DescriptionOutlined /> },
      {
        text: "Invoice Items",
        path: "/invoice-items",
        icon: <ReceiptLongOutlined />,
      },
      { text: "Payments", path: "/payments", icon: <PaymentOutlined /> },
    ],
  },
  {
    id: "orders",
    title: "Orders",
    color: "#2e7d32",
    icon: <ShoppingCartOutlined />,
    children: [
      { text: "Order List", path: "/orders", icon: <LocalShippingOutlined /> },
    ],
  },
  {
    id: "catalog",
    title: "Catalog & Settings",
    color: "#9c27b0",
    icon: <CategoryOutlined />,
    children: [
      { text: "Brands", path: "/brands", icon: <LabelOutlined /> },
      { text: "Families", path: "/families", icon: <ClassOutlined /> },
      { text: "Models", path: "/models", icon: <ViewListOutlined /> },
      { text: "Warehouses", path: "/warehouses", icon: <WarehouseOutlined /> },
      { text: "Attributes", path: "/attributes", icon: <TuneOutlined /> },
      {
        text: "Attribute Options",
        path: "/attribute-options",
        icon: <ListAltOutlined />,
      },
      {
        text: "Product Types",
        path: "/product-types",
        icon: <CategoryOutlined />,
      },
      { text: "Categories", path: "/categories", icon: <ClassOutlined /> },
    ],
  },
];

// ================= COMPONENT =================

export function SideBar({ open, handleDrawerClose }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({});
  const [hoverOpen, setHoverOpen] = useState(false);

  const isDrawerOpen = open || hoverOpen;

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
        CepTek
      </Typography>
      <Typography
        align="center"
        sx={{
          fontSize: isDrawerOpen ? "14px" : 0,
          color: theme.palette.info.main,
        }}
      >
        Admin
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
                        transform: "translateX(4px)",
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
                              transform: "translateX(6px)",
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
