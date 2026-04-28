"use client";

import { type MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CheckCheck, LogOut, Menu, Moon, Settings, Sun, User } from "lucide-react";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MuiMenu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useLayout } from "./LayoutProvider";
import { useThemeMode } from "@/components/ThemeRegistry";
import { getCurrentProfile } from "@/app/actions/profile";
import {
  getNotificationsAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/app/actions/notifications";
import { createClient } from "@/lib/supabase/client";
import { APP_COUNTS_CHANGED_EVENT, notifyAppCountsChanged } from "@/lib/client-events";
import { formatDateTime } from "@/lib/date-utils";

interface HeaderProfile {
  full_name: string;
  avatar_url?: string | null;
  role: "admin" | "client";
}

interface HeaderNotification {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  is_read: boolean;
  created_at: string;
  related_project_id?: string | null;
  related_meeting_id?: string | null;
}

export function Header() {
  const { toggleMobileDrawer } = useLayout();
  const { mode, toggleMode } = useThemeMode();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname.startsWith("/admin");
  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loadHeaderData = useCallback(async () => {
    const [profileData, notificationsData] = await Promise.all([
      getCurrentProfile(),
      getNotificationsAction(),
    ]);

    if (profileData) {
      setProfile({
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        role: profileData.role,
      });
    }

    setNotifications(notificationsData.notifications as HeaderNotification[]);
    setUnreadNotificationCount(notificationsData.unreadCount);
  }, []);

  useEffect(() => {
    loadHeaderData();
  }, [loadHeaderData, pathname]);

  useEffect(() => {
    const handleCountsChanged = () => {
      void loadHeaderData();
    };

    window.addEventListener(APP_COUNTS_CHANGED_EVENT, handleCountsChanged);
    return () => window.removeEventListener(APP_COUNTS_CHANGED_EVENT, handleCountsChanged);
  }, [loadHeaderData]);

  useEffect(() => {
    const supabase = createClient();
    
    // Subscribe to REALTIME notifications
    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          loadHeaderData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadHeaderData]);

  const totalUnread = useMemo(() => {
    return unreadNotificationCount;
  }, [unreadNotificationCount]);

  const initials = useMemo(() => {
    if (!profile?.full_name) {
      return isAdmin ? "AD" : "CL";
    }

    return profile.full_name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [isAdmin, profile]);

  const getNotificationHref = useCallback((notification: HeaderNotification) => {
    const base = isAdmin ? "/admin" : "/client";

    if (notification.related_project_id) {
      return `${base}/projects/${notification.related_project_id}`;
    }

    if (notification.related_meeting_id) {
      return `${base}/meetings`;
    }

    return base;
  }, [isAdmin]);

  const handleOpenNotifications = (event: MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
    void loadHeaderData();
  };

  const handleNotificationClick = async (notification: HeaderNotification) => {
    if (!notification.is_read) {
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item))
      );
      setUnreadNotificationCount((current) => Math.max(0, current - 1));
      await markNotificationAsReadAction(notification.id);
      notifyAppCountsChanged();
    }

    setNotificationsAnchor(null);
    router.push(getNotificationHref(notification));
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
    setUnreadNotificationCount(0);
    await markAllNotificationsAsReadAction();
    notifyAppCountsChanged();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUserAnchor(null);
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 } }}>
        {/* Mobile menu button */}
        <IconButton
          edge="start"
          onClick={() => toggleMobileDrawer(true)}
          sx={{ display: { md: "none" }, mr: 1, color: "text.secondary" }}
        >
          <Menu size={24} />
        </IconButton>

        <Typography
          variant="h6"
          sx={{ display: { xs: "none", md: "block" }, fontWeight: 600, color: "text.primary", fontSize: "1.125rem" }}
        >
          Beard Click Design
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton sx={{ color: "text.secondary", mr: 0.5 }} onClick={toggleMode}>
          {mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>

        {/* Notifications */}
        <IconButton
          sx={{ color: "text.secondary" }}
          onClick={handleOpenNotifications}
        >
          <Badge badgeContent={totalUnread} color="error" overlap="circular">
            <Bell size={20} />
          </Badge>
        </IconButton>

        {/* Avatar */}
        <IconButton sx={{ ml: 1.5, p: 0 }} onClick={(event) => setUserAnchor(event.currentTarget)}>
          <Avatar
            src={profile?.avatar_url || undefined}
            sx={{
              width: 34,
              height: 34,
              bgcolor: "primary.main",
              fontSize: "0.8125rem",
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>
        </IconButton>
      </Toolbar>

      <MuiMenu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={() => setNotificationsAnchor(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5, minWidth: 260 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Notificaciones
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {unreadNotificationCount > 0 ? `${unreadNotificationCount} sin leer` : "Todo al dia"}
              </Typography>
            </Box>
            {unreadNotificationCount > 0 && (
              <Button
                size="small"
                variant="text"
                onClick={handleMarkAllNotificationsRead}
                startIcon={<CheckCheck size={15} />}
              >
                Leidas
              </Button>
            )}
          </Box>
        </Box>
        <Divider />
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                alignItems: "flex-start",
                gap: 1,
                py: 1.25,
                maxWidth: 360,
                bgcolor: notification.is_read ? "transparent" : "action.hover",
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: notification.is_read ? "transparent" : "error.main",
                  flex: "0 0 auto",
                  mt: 0.75,
                }}
              />
              <ListItemText
                primary={notification.title}
                secondary={
                  <Box component="span" sx={{ display: "block" }}>
                    {notification.message && (
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", whiteSpace: "normal" }}
                      >
                        {notification.message}
                      </Typography>
                    )}
                    <Typography component="span" variant="caption" color="text.secondary">
                      {formatDateTime(notification.created_at)}
                    </Typography>
                  </Box>
                }
                slotProps={{
                  primary: {
                    variant: "body2",
                    sx: { fontWeight: notification.is_read ? 500 : 700, whiteSpace: "normal" },
                  } as any,
                }}
              />
            </MenuItem>
          ))
        ) : (
          <Box sx={{ px: 2, py: 3, minWidth: 280, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No hay notificaciones.
            </Typography>
          </Box>
        )}
      </MuiMenu>

      <MuiMenu
        anchorEl={userAnchor}
        open={Boolean(userAnchor)}
        onClose={() => setUserAnchor(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5, minWidth: 220 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {profile?.full_name || "Usuario"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isAdmin ? "Administrador" : "Cliente"}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { toggleMode(); setUserAnchor(null); }}>
          <ListItemIcon>
            {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </ListItemIcon>
          <ListItemText primary={mode === "dark" ? "Modo claro" : "Modo oscuro"} />
        </MenuItem>
        <MenuItem
          component={Link}
          href={isAdmin ? "/admin/profile" : "/client/profile"}
          onClick={() => setUserAnchor(null)}
        >
          <ListItemIcon>
            {isAdmin ? <Settings size={18} /> : <User size={18} />}
          </ListItemIcon>
          <ListItemText primary={isAdmin ? "Mi Perfil" : "Mi Perfil"} />
        </MenuItem>
        <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
          <ListItemIcon>
            {isLoggingOut ? <CircularProgress size={16} /> : <LogOut size={18} />}
          </ListItemIcon>
          <ListItemText primary={isLoggingOut ? "Saliendo..." : "Cerrar Sesion"} />
        </MenuItem>
      </MuiMenu>
    </AppBar>
  );
}

