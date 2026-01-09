import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Avatar,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import logoDesenvolve from "../../../assets/images/logo/LOGO DESENVOLVE.png";
import logo2 from "../../../assets/images/logo/logo2.svg";
import { APP_ROUTES } from "../../../util/constants";

const drawerWidth = 240;
const collapsedWidth = 60;

interface SidebarMenu {
  icon: React.ReactNode;
  label: string;
  to: string;
}

interface SidebarMenuGroup {
  title?: string;
  menus: SidebarMenu[];
}

interface SidebarProps {
  collapsed: boolean;
  menuGroups: SidebarMenuGroup[];
  onClose?: () => void;
}

const UserBox: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: collapsed ? "column" : "row",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        p: 2,
        borderTop: "1px solid #E5E7EB",
        mt: "auto",
        gap: 1,
        backgroundColor: "#FAFAFA",
      }}
      >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          background: "#E5E7EB",
          fontWeight: 500,
          fontSize: "0.8rem",
          color: "#9CA3AF",
        }}
      >
        {user.first_name?.[0] || user.email?.[0] || "U"}
      </Avatar>
      {!collapsed && (
        <Box sx={{ ml: 1, flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              fontWeight: 500,
              color: "#6B7280",
              fontSize: "0.8125rem",
            }}
          >
            {user.first_name} {user.last_name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ fontSize: "0.6875rem", color: "#9CA3AF" }}
          >
            {user.email}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const LayoutSidebar: React.FC<SidebarProps> = ({
  collapsed,
  menuGroups,
  onClose,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Se está colapsado, pode expandir por hover
  // Se não está colapsado (aberto por clique), não fecha no mouseLeave
  const isExpanded = !collapsed || (collapsed && isHovered);

  const handleMouseEnter = () => {
    if (collapsed) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    // Só fecha por hover se estiver colapsado (aberto apenas por hover)
    if (collapsed) {
      setIsHovered(false);
    }
  };

  const handleLogoClick = () => {
    navigate(APP_ROUTES.DASHBOARD);
  };

  return (
    <Drawer
      variant="permanent"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        width: collapsedWidth,
        flexShrink: 0,
        position: "relative",
        zIndex: 1300,
        "& .MuiDrawer-paper": {
          width: isExpanded ? drawerWidth : collapsedWidth,
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          bgcolor: "#FFFFFF",
          borderRight: "1px solid #F3F4F6",
          display: "flex",
          flexDirection: "column",
          alignItems: isExpanded ? "flex-start" : "center",
          position: "fixed",
          height: "100vh",
          top: 0,
          left: 0,
          boxShadow: "none",
        },
      }}
    >
      <Toolbar
        sx={{
          minHeight: 64,
          display: "flex",
          justifyContent: isExpanded ? "space-between" : "center",
          alignItems: "center",
          px: isExpanded ? 2 : 0,
          width: "100%",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* Logo */}
        <Box
          onClick={handleLogoClick}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.2s ease",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          {isExpanded ? (
            <Box
              component="img"
              src={logoDesenvolve}
              alt="Desenvolve"
              sx={{
                width: 180,
                height: "auto",
              }}
            />
          ) : (
            <Box
              component="img"
              src={logo2}
              alt="Desenvolve"
              sx={{
                width: 32,
                height: "auto",
              }}
            />
          )}
        </Box>

        {!collapsed && onClose && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#6B7280",
              "&:hover": {
                color: "#A650F0",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Toolbar>

    <Box
      sx={{
        width: "100%",
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {menuGroups.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          {group.title && isExpanded && (
            <Box sx={{ px: 2, py: 2, pt: groupIndex === 0 ? 3 : 3 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "#9CA3AF",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {group.title}
              </Typography>
            </Box>
          )}
          {groupIndex === 0 && !isExpanded && (
            <Box sx={{ my: 1 }} />
          )}
          <List
            sx={{
              width: "100%",
              p: 0,
              px: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: isExpanded ? "flex-start" : "center",
            }}
          >
            {group.menus.map(({ icon, label, to }) => (
              <ListItemButton
                key={to}
                component={Link}
                to={to}
                sx={{
                  justifyContent: isExpanded ? "flex-start" : "center",
                  px: isExpanded ? 2 : 1,
                  py: 1.25,
                  width: "100%",
                  borderRadius: 1.5,
                  mb: 0.25,
                  color: "#9CA3AF",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    color: "#6B7280",
                    backgroundColor: "#F9FAFB",
                  },
                  "&.active": {
                    backgroundColor: "#F3F4F6",
                    color: "#1F2937",
                    fontWeight: 500,
                    "& .MuiListItemIcon-root": {
                      color: "#1F2937",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    justifyContent: "center",
                    marginRight: isExpanded ? 2 : 0,
                    color: "inherit",
                    fontSize: "1.25rem",
                  }}
                >
                  {icon}
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: "0.8125rem",
                      fontWeight: 400,
                    }}
                    sx={{ flexGrow: 1, minWidth: 0 }}
                  />
                )}
              </ListItemButton>
            ))}
          </List>
          {groupIndex < menuGroups.length - 1 && isExpanded && (
            <Divider sx={{ my: 2, mx: 2, borderColor: "#E5E7EB" }} />
          )}
        </React.Fragment>
      ))}
    </Box>
    <UserBox collapsed={!isExpanded} />
  </Drawer>
  );
};

export default LayoutSidebar;
