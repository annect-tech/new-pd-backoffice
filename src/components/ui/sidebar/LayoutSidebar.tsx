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
        p: collapsed ? 1.5 : 2,
        borderTop: "1px solid rgba(0, 0, 0, 0.06)",
        mt: "auto",
        gap: 1.5,
        background: "linear-gradient(to bottom, #FAFAFA, #FFFFFF)",
        transition: "all 0.2s ease",
      }}
    >
      <Avatar
        sx={{
          width: collapsed ? 36 : 40,
          height: collapsed ? 36 : 40,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          fontWeight: 600,
          fontSize: collapsed ? "0.875rem" : "0.9375rem",
          color: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(102, 126, 234, 0.25)",
          transition: "all 0.2s ease",
        }}
      >
        {user.first_name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
      </Avatar>
      {!collapsed && (
        <Box sx={{ ml: 0.5, flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              fontWeight: 600,
              color: "#1F2937",
              fontSize: "0.875rem",
              mb: 0.25,
            }}
          >
            {user.first_name} {user.last_name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ fontSize: "0.75rem", color: "#6B7280" }}
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
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          bgcolor: "#FFFFFF",
          borderRight: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: isExpanded ? "flex-start" : "center",
          position: "fixed",
          height: "100vh",
          top: 0,
          left: 0,
          boxShadow: "0 0 40px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <Toolbar
        sx={{
          minHeight: 72,
          display: "flex",
          justifyContent: isExpanded ? "space-between" : "center",
          alignItems: "center",
          px: isExpanded ? 2.5 : 0,
          width: "100%",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
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
            transition: "transform 0.2s ease, opacity 0.2s ease",
            "&:hover": {
              opacity: 0.85,
              transform: "scale(1.02)",
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
              color: "#9CA3AF",
              transition: "all 0.2s ease",
              "&:hover": {
                color: "#667eea",
                backgroundColor: "rgba(102, 126, 234, 0.08)",
                transform: "rotate(90deg)",
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
            <Box sx={{ px: 2.5, py: 2, pt: groupIndex === 0 ? 3 : 2.5 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "#6B7280",
                  fontWeight: 700,
                  fontSize: "0.6875rem",
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
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
                  py: 1.5,
                  width: "100%",
                  borderRadius: 2,
                  mb: 0.5,
                  color: "#6B7280",
                  position: "relative",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "3px",
                    height: 0,
                    backgroundColor: "#667eea",
                    borderRadius: "0 4px 4px 0",
                    transition: "height 0.2s ease",
                  },
                  "&:hover": {
                    color: "#1F2937",
                    backgroundColor: "rgba(102, 126, 234, 0.06)",
                    transform: "translateX(2px)",
                    "& .MuiListItemIcon-root": {
                      color: "#667eea",
                    },
                  },
                  "&.active": {
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                    color: "#667eea",
                    fontWeight: 600,
                    boxShadow: "0 2px 4px rgba(102, 126, 234, 0.08)",
                    "&::before": {
                      height: "70%",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "#667eea",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    justifyContent: "center",
                    marginRight: isExpanded ? 2.5 : 0,
                    color: "inherit",
                    fontSize: "1.25rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  {icon}
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                    sx={{ flexGrow: 1, minWidth: 0 }}
                  />
                )}
              </ListItemButton>
            ))}
          </List>
          {groupIndex < menuGroups.length - 1 && isExpanded && (
            <Divider sx={{ my: 2.5, mx: 2.5, borderColor: "rgba(0, 0, 0, 0.06)" }} />
          )}
        </React.Fragment>
      ))}
    </Box>
    <UserBox collapsed={!isExpanded} />
  </Drawer>
  );
};

export default LayoutSidebar;
