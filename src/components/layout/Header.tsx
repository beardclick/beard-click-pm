"use client";

import { Bell, Menu } from "lucide-react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { useLayout } from "./LayoutProvider";

export function Header() {
  const { toggleMobileDrawer } = useLayout();

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

        {/* Notifications */}
        <IconButton sx={{ color: "text.secondary" }}>
          <Badge
            variant="dot"
            color="error"
            overlap="circular"
          >
            <Bell size={20} />
          </Badge>
        </IconButton>

        {/* Avatar */}
        <Avatar
          sx={{
            ml: 2,
            width: 34,
            height: 34,
            bgcolor: "primary.main",
            fontSize: "0.8125rem",
            fontWeight: 700,
          }}
        >
          AD
        </Avatar>
      </Toolbar>
    </AppBar>
  );
}

