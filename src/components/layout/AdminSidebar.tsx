"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Briefcase,
  Users,
  Calendar,
  MessageSquare,
  LogOut,
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
import { getSidebarCounts } from "@/app/actions/sidebar";

export function AdminSidebar() {
  const pathname = usePathname();
  const { isMobileDrawerOpen, toggleMobileDrawer } = useLayout();
  const [counts, setCounts] = useState<any>(null);

  useEffect(() => {
    async function fetchCounts() {
      const data = await getSidebarCounts();
      setCounts(data);
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: "Inicio", href: "/admin", icon: Home, countKey: null },
    { name: "Proyectos", href: "/admin/projects", icon: Briefcase, countKey: 'projects' },
    { name: "Clientes", href: "/admin/clients", icon: Users, countKey: 'clients' },
    { name: "Reuniones", href: "/admin/meetings", icon: Calendar, countKey: 'meetings' },
    { name: "Comentarios", href: "/admin/comments", icon: MessageSquare, countKey: 'comments' },
    { name: "Calendario", href: "/admin/calendar", icon: Calendar, countKey: null },
  ];

  const SidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo & Close for Mobile */}
      <Box sx={{ height: 64, display: "flex", alignItems: "center", justifyContent: 'space-between', px: 3, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "-0.025em" }}>
          Beard Click
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
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
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
                          sx={{ 
                            '& .MuiBadge-badge': { 
                              fontSize: '0.65rem', 
                              height: 18, 
                              minWidth: 18,
                              bgcolor: countData.unread > 0 ? 'error.main' : 'grey.300',
                              color: countData.unread > 0 ? 'white' : 'text.secondary',
                              transition: 'all 0.3s ease'
                            } 
                          }}
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
        <ListItemButton
          sx={{
            borderRadius: 1.5,
            "&:hover": { bgcolor: "#fef2f2", color: "#b91c1c" },
            "& .MuiListItemIcon-root": { color: "text.secondary" },
            "&:hover .MuiListItemIcon-root": { color: "#b91c1c" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogOut size={20} />
          </ListItemIcon>
          <ListItemText 
            primary={
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                Cerrar Sesión
              </Typography>
            } 
          />
        </ListItemButton>
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

