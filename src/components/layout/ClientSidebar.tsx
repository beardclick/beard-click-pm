"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Briefcase,
  Calendar,
  MessageSquare,
  X,
} from "lucide-react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import { useLayout } from "./LayoutProvider";
import { getClientSidebarCounts } from "@/app/actions/sidebar";
import { LogoutListItem } from "./LogoutListItem";
import { APP_COUNTS_CHANGED_EVENT } from "@/lib/client-events";

export function ClientSidebar() {
  const pathname = usePathname();
  const { isMobileDrawerOpen, toggleMobileDrawer } = useLayout();
  const [counts, setCounts] = useState<any>(null);

  const fetchCounts = useCallback(async () => {
    const data = await getClientSidebarCounts('current');
    setCounts(data);
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    window.addEventListener(APP_COUNTS_CHANGED_EVENT, fetchCounts);

    return () => {
      clearInterval(interval);
      window.removeEventListener(APP_COUNTS_CHANGED_EVENT, fetchCounts);
    };
  }, [fetchCounts]);

  const navItems = [
    { name: "Inicio", href: "/client", icon: Home, countKey: null },
    { name: "Mis Proyectos", href: "/client/projects", icon: Briefcase, countKey: 'projects' },
    { name: "Reuniones", href: "/client/meetings", icon: Calendar, countKey: 'meetings' },
    { name: "Comentarios", href: "/client/comments", icon: MessageSquare, countKey: 'comments' },
  ];

  const SidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo & Close for Mobile */}
      <Box sx={{ height: 64, display: "flex", alignItems: "center", justifyContent: 'space-between', px: 3, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "-0.025em" }}>
          Portal Cliente
        </Typography>
        <IconButton 
          onClick={() => toggleMobileDrawer(false)}
          sx={{ display: { xs: 'flex', md: 'none' }, color: 'text.secondary' }}
        >
          <X size={20} />
        </IconButton>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        <List disablePadding>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/client" && pathname.startsWith(`${item.href}/`));
            const countData = item.countKey ? counts?.[item.countKey] : null;

            return (
              <ListItemButton
                key={item.name}
                component={Link}
                href={item.href}
                selected={isActive}
                onClick={() => toggleMobileDrawer(false)}
                sx={{
                  mx: 1,
                  borderRadius: 1.5,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    color: "primary.dark",
                    "&:hover": { bgcolor: "primary.light" },
                    "& .MuiListItemIcon-root": { color: "primary.dark" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? "primary.dark" : "text.secondary" }}>
                  <item.icon size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: isActive ? 600 : 500 }}>
                        {item.name}
                      </Typography>
                      {countData !== null && countData !== undefined && (
                        <Badge 
                          badgeContent={countData.total} 
                          showZero
                          sx={(theme) => ({ 
                            '& .MuiBadge-badge': { 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem', 
                              height: 18, 
                              minWidth: 18,
                              lineHeight: 1,
                              paddingTop: '1px',
                              border: `1px solid ${theme.palette.divider}`,
                              bgcolor: countData.unread > 0 ? theme.palette.error.main : theme.palette.background.default,
                              color: countData.unread > 0 ? theme.palette.error.contrastText : theme.palette.text.primary,
                              transition: 'all 0.3s ease'
                            } 
                          })}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Logout */}
      <Divider />
      <Box sx={{ p: 1 }}>
        <LogoutListItem onAfterLogout={() => toggleMobileDrawer(false)} />
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        sx={{
          width: 260,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          bgcolor: "background.paper",
          borderRight: 1,
          borderColor: "divider",
          height: "100%",
        }}
      >
        {SidebarContent}
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={isMobileDrawerOpen}
        onClose={() => toggleMobileDrawer(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: 260 },
        }}
      >
        {SidebarContent}
      </Drawer>
    </>
  );
}

