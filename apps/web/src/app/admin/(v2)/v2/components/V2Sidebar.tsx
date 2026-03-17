"use client";

import { signOut } from "@/actions/common/auth";
import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { ArrowLeft, Home, Image, LogOut, Menu, ScrollText, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { ADMIN_V2_ROUTES } from "../constants/routes";

const EXPANDED_WIDTH = 220;
const COLLAPSED_WIDTH = 56;

const NAV_ITEMS = [
  { title: "유저 관리", href: ADMIN_V2_ROUTES.USERS, icon: Users },
  { title: "콘텐츠 관리", href: ADMIN_V2_ROUTES.CONTENTS, icon: ScrollText },
  { title: "배너 관리", href: ADMIN_V2_ROUTES.BANNERS, icon: Image },
] as const;

interface SidebarContextValue {
  expanded: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({ expanded: true, toggle: () => {} });

export function useSidebarExpanded() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <SidebarContext.Provider value={{ expanded, toggle: () => setExpanded(p => !p) }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function V2Sidebar() {
  const pathname = usePathname();
  const { expanded, toggle } = useSidebarExpanded();
  const drawerWidth = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: "width 200ms ease",
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          transition: "width 200ms ease",
          overflowX: "hidden",
          position: "relative",
          borderRight: 1,
          borderColor: "divider",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1.5, minHeight: 48 }}>
        <IconButton size="small" onClick={toggle} sx={{ flexShrink: 0 }}>
          <Menu size={18} />
        </IconButton>
        {expanded && (
          <Link
            href={ADMIN_V2_ROUTES.HOME}
            style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
          >
            <PolliaIcon style={{ width: 22, height: 22 }} />
            <PolliaWordmark style={{ height: 20, width: "auto" }} />
            <Typography variant="body2" color="text.disabled" sx={{ ml: -0.5, mb: -0.25 }}>
              v2
            </Typography>
          </Link>
        )}
      </Box>

      <Divider />

      <List sx={{ flex: 1, py: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <ListItem key={item.href} disablePadding sx={{ display: "block" }}>
              <Tooltip title={expanded ? "" : item.title} placement="right" arrow>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={active}
                  sx={{
                    minHeight: 40,
                    justifyContent: expanded ? "initial" : "center",
                    px: expanded ? 2 : 1.5,
                    borderRadius: 1,
                    mx: 0.5,
                    mb: 0.25,
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 0, mr: expanded ? 1.5 : 0, justifyContent: "center" }}
                  >
                    <item.icon size={20} />
                  </ListItemIcon>
                  {expanded && (
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{ fontSize: "0.875rem" }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      <List sx={{ py: 1 }}>
        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip title={expanded ? "" : "홈으로가기"} placement="right" arrow>
            <ListItemButton
              component={Link}
              href="/"
              sx={{
                minHeight: 40,
                justifyContent: expanded ? "initial" : "center",
                px: expanded ? 2 : 1.5,
                borderRadius: 1,
                mx: 0.5,
                mb: 0.25,
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: expanded ? 1.5 : 0, justifyContent: "center" }}>
                <Home size={20} />
              </ListItemIcon>
              {expanded && (
                <ListItemText
                  primary="홈으로가기"
                  primaryTypographyProps={{ fontSize: "0.875rem" }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip title={expanded ? "" : "기존 Admin"} placement="right" arrow>
            <ListItemButton
              component={Link}
              href={ADMIN_ROUTES.ADMIN}
              sx={{
                minHeight: 40,
                justifyContent: expanded ? "initial" : "center",
                px: expanded ? 2 : 1.5,
                borderRadius: 1,
                mx: 0.5,
                mb: 0.25,
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: expanded ? 1.5 : 0, justifyContent: "center" }}>
                <ArrowLeft size={20} />
              </ListItemIcon>
              {expanded && (
                <ListItemText
                  primary="기존 Admin"
                  primaryTypographyProps={{ fontSize: "0.875rem" }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip title={expanded ? "" : "로그아웃"} placement="right" arrow>
            <ListItemButton
              onClick={() => signOut(ADMIN_ROUTES.ADMIN_LOGIN)}
              sx={{
                minHeight: 40,
                justifyContent: expanded ? "initial" : "center",
                px: expanded ? 2 : 1.5,
                borderRadius: 1,
                mx: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: expanded ? 1.5 : 0, justifyContent: "center" }}>
                <LogOut size={20} />
              </ListItemIcon>
              {expanded && (
                <ListItemText
                  primary="로그아웃"
                  primaryTypographyProps={{ fontSize: "0.875rem" }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Drawer>
  );
}
