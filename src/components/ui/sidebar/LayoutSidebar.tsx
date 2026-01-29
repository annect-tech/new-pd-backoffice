
import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
} from "@mui/material";
import { Link } from "react-router";
import { designSystem } from "../../../styles/designSystem";

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

// UserBox removed: no bottom profile box should render in the sidebar (collapsed or expanded)

const LayoutSidebar: React.FC<SidebarProps> = ({
  collapsed,
  menuGroups,
}) => {
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
          overflowY: "auto",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          bgcolor: (theme) => theme.palette.mode === "dark" ? "#1E1E1E" : "#FFFFFF",
          borderRight: (theme) => theme.palette.mode === "dark" 
            ? "1px solid rgba(255, 255, 255, 0.1)" 
            : "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          position: "fixed",
          height: "100vh",
          top: 0,
          left: 0,
          boxShadow: "0 0 40px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
    <Box
      sx={{
        width: "100%",
        flex: 1,
        overflowY: isExpanded ? "auto" : "hidden",
        overflowX: "hidden",
      }}
    >
      {menuGroups.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          {/* {group.title && isExpanded && (
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                  fontWeight: 700,
                  fontSize: "0.6875rem",
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                }}
              >
                {group.title}
              </Typography>
            </Box>
          )} */}
          <List
            sx={{
              width: "100%",
              p: 0,
              px: isExpanded ? 1.5 : 0,
              pt: groupIndex === 0 ? 1 : 0,
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
                  px: isExpanded ? 1.5 : 0,
                  py: 1.25,
                  width: "100%",
                  borderRadius: 1.5,
                  mb: 0.25,
                  color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                  position: "relative",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&::before": {
                    content: isExpanded ? '""' : "none",
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "3px",
                    height: 0,
                    backgroundColor: designSystem.colors.primary.main,
                    borderRadius: "0 4px 4px 0",
                    transition: "height 0.2s ease",
                  },
                  "&:hover": {
                    color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                    backgroundColor: (theme) => theme.palette.mode === "dark" 
                      ? "rgba(166, 80, 240, 0.15)" 
                      : "rgba(166, 80, 240, 0.06)",
                    transform: isExpanded ? "translateX(2px)" : "none",
                    "& .MuiListItemIcon-root": {
                      color: designSystem.colors.primary.main,
                    },
                  },
                  "&.active": {
                    backgroundColor: (theme) => theme.palette.mode === "dark" 
                      ? "rgba(166, 80, 240, 0.2)" 
                      : "rgba(166, 80, 240, 0.1)",
                    color: designSystem.colors.primary.main,
                    fontWeight: 600,
                    boxShadow: (theme) => theme.palette.mode === "dark" 
                      ? "0 2px 4px rgba(166, 80, 240, 0.2)" 
                      : "0 2px 4px rgba(166, 80, 240, 0.08)",
                    "&::before": {
                      height: "70%",
                    },
                    "& .MuiListItemIcon-root": {
                      color: designSystem.colors.primary.main,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: isExpanded ? collapsedWidth - 16 : collapsedWidth,
                    width: isExpanded ? collapsedWidth - 16 : collapsedWidth,
                    justifyContent: "center",
                    marginRight: 0,
                    color: "inherit",
                    fontSize: "1.25rem",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                  sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    opacity: isExpanded ? 1 : 0,
                    width: isExpanded ? "auto" : 0,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    transitionDelay: isExpanded ? "0.05s" : "0s",
                  }}
                />
              </ListItemButton>
            ))}
          </List>
          {groupIndex < menuGroups.length - 1 && isExpanded && (
            <Divider 
              sx={{ 
                my: 2.5, 
                mx: 2.5, 
                borderColor: (theme) => theme.palette.mode === "dark" 
                  ? "rgba(255, 255, 255, 0.1)" 
                  : "rgba(0, 0, 0, 0.06)" 
              }} 
            />
          )}
        </React.Fragment>
      ))}
      {/* Espaço em branco no final para evitar problemas de scroll */}
      <Box sx={{ py: 3 }} />
    </Box>
  </Drawer>
  );
};

export default LayoutSidebar;
