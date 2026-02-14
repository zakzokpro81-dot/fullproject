import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import { styled, useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";

import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import {
  ContactsOutlined,
  HomeOutlined,
  PeopleOutline,
  ReceiptOutlined,
} from "@mui/icons-material";
import { Avatar, Tooltip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { grey } from "@mui/material/colors";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

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
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

// const basicJubs = [
//   { text: "CategoryList", icon: <HomeOutlined />, path: "/CategoryList" },
//   {
//     text: "ProductTypeList",
//     icon: <PeopleOutline />,
//     path: "/ProductTypeList",
//   },
//   {
//     text: "ProductTypeAttributesList",
//     icon: <ContactsOutlined />,
//     path: "/ProductTypeAttributesList",
//   },
//   { text: "AttributeList", icon: <ReceiptOutlined />, path: "/AttributeList" },
// ];

const basicJubs = [
  { text: "AccountList", icon: <HomeOutlined />, path: "/AccountList" },
  {
    text: "InvoiceList",
    icon: <PeopleOutline />,
    path: "/InvoiceList",
  },
  {
    text: "OrderList",
    icon: <ContactsOutlined />,
    path: "/OrderList",
  },
  { text: "AttributeList", icon: <ReceiptOutlined />, path: "/AttributeList" },
];

const basicJubs2 = [
  {
    text: "AttributeOptionList",
    icon: <HomeOutlined />,
    path: "/AttributeOptionList",
  },
  { text: "CustomerList", icon: <PeopleOutline />, path: "/CustomerList" },
  {
    text: "CustomerTypeList",
    icon: <ContactsOutlined />,
    path: "/CustomerTypeList",
  },
  { text: "PaymentList", icon: <ReceiptOutlined />, path: "/PaymentList" },
];

// const basicJubs3 = [
//   { text: "BrandList", icon: <HomeOutlined />, path: "/BrandList" },
//   { text: "FamilyList", icon: <PeopleOutline />, path: "/FamilyList" },
//   { text: "ModelsList", icon: <ContactsOutlined />, path: "/ModelsList" },
//   { text: "ProductsList", icon: <ReceiptOutlined />, path: "/ProductsList" },
// ];

const basicJubs3 = [
  {
    text: "WarehouseStockList",
    icon: <HomeOutlined />,
    path: "/WarehouseStockList",
  },
  {
    text: "StockMovementList",
    icon: <PeopleOutline />,
    path: "/StockMovementList",
  },
  { text: "ModelsList", icon: <ContactsOutlined />, path: "/ModelsList" },
  { text: "ProductsList", icon: <ReceiptOutlined />, path: "/ProductsList" },
];

const basicJubs4 = [
  { text: "BulkAddProducts", icon: <HomeOutlined />, path: "/BulkAddProducts" },
  { text: "WarehousesList", icon: <PeopleOutline />, path: "/WarehousesList" },
  { text: "InvoiceList", icon: <ContactsOutlined />, path: "/InvoiceList" },
  {
    text: "InvoiceItemsList",
    icon: <ReceiptOutlined />,
    path: "/InvoiceItemsList",
  },
];

export function SideBar({ open, handleDrawerClose }) {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Drawer variant="permanent" open={open}>
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
          width: open ? "88px" : "44px",
          transition: "0.25s",
          height: open ? "88px" : "44px",
          border: "2px solid grey",
          my: 1,
        }}
        src="../src/images/zek.jpeg"
      />
      <Typography
        align="center"
        sx={{ fontSize: open ? "17" : 0, transition: "0.25s" }}
      >
        CepTek
      </Typography>
      <Typography
        align="center"
        sx={{
          fontSize: open ? "17" : 0,
          transition: "0.25s",
          color: theme.palette.info.main,
        }}
      >
        Admin
      </Typography>
      <Divider />
      <List>
        {basicJubs.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
            <Tooltip title={open ? null : item.text} placement="left">
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                }}
                sx={[
                  {
                    minHeight: 48,
                    px: 2.5,
                    bgcolor:
                      location.pathname === item.path
                        ? theme.palette.mode === "dark"
                          ? grey[800]
                          : grey[400]
                        : null,
                  },
                  open
                    ? {
                        justifyContent: "initial",
                      }
                    : {
                        justifyContent: "center",
                      },
                ]}
              >
                <ListItemIcon
                  sx={[
                    {
                      minWidth: 0,
                      justifyContent: "center",
                    },
                    open
                      ? {
                          mr: 3,
                        }
                      : {
                          mr: "auto",
                        },
                  ]}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={[
                    open
                      ? {
                          opacity: 1,
                        }
                      : {
                          opacity: 0,
                        },
                  ]}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Divider />
      <List>
        {basicJubs2.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
            <Tooltip title={open ? null : item.text} placement="left">
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                }}
                sx={[
                  {
                    minHeight: 48,
                    px: 2.5,
                    bgcolor:
                      location.pathname === item.path
                        ? theme.palette.mode === "dark"
                          ? grey[800]
                          : grey[400]
                        : null,
                  },
                  open
                    ? {
                        justifyContent: "initial",
                      }
                    : {
                        justifyContent: "center",
                      },
                ]}
              >
                <ListItemIcon
                  sx={[
                    {
                      minWidth: 0,
                      justifyContent: "center",
                    },
                    open
                      ? {
                          mr: 3,
                        }
                      : {
                          mr: "auto",
                        },
                  ]}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={[
                    open
                      ? {
                          opacity: 1,
                        }
                      : {
                          opacity: 0,
                        },
                  ]}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        {basicJubs3.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
            <Tooltip title={open ? null : item.text} placement="left">
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                }}
                sx={[
                  {
                    minHeight: 48,
                    px: 2.5,
                    bgcolor:
                      location.pathname === item.path
                        ? theme.palette.mode === "dark"
                          ? grey[800]
                          : grey[400]
                        : null,
                  },
                  open
                    ? {
                        justifyContent: "initial",
                      }
                    : {
                        justifyContent: "center",
                      },
                ]}
              >
                <ListItemIcon
                  sx={[
                    {
                      minWidth: 0,
                      justifyContent: "center",
                    },
                    open
                      ? {
                          mr: 3,
                        }
                      : {
                          mr: "auto",
                        },
                  ]}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={[
                    open
                      ? {
                          opacity: 1,
                        }
                      : {
                          opacity: 0,
                        },
                  ]}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <List>
        {basicJubs4.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
            <Tooltip title={open ? null : item.text} placement="left">
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                }}
                sx={[
                  {
                    minHeight: 48,
                    px: 2.5,
                    bgcolor:
                      location.pathname === item.path
                        ? theme.palette.mode === "dark"
                          ? grey[800]
                          : grey[400]
                        : null,
                  },
                  open
                    ? {
                        justifyContent: "initial",
                      }
                    : {
                        justifyContent: "center",
                      },
                ]}
              >
                <ListItemIcon
                  sx={[
                    {
                      minWidth: 0,
                      justifyContent: "center",
                    },
                    open
                      ? {
                          mr: 3,
                        }
                      : {
                          mr: "auto",
                        },
                  ]}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={[
                    open
                      ? {
                          opacity: 1,
                        }
                      : {
                          opacity: 0,
                        },
                  ]}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Drawer>
  );
}
