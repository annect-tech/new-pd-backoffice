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
import { Link } from "react-router";
import { useAuth } from "../../../hooks/useAuth";

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
        borderTop: "1px solid",
        borderColor: "divider",
        mt: "auto",
        gap: 1,
      }}
    >
      <Avatar sx={{ width: 40, height: 40 }}>
        {user.first_name?.[0] || user.email?.[0] || "U"}
      </Avatar>
      {!collapsed && (
        <Box sx={{ ml: 1, flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap>
            {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.email}
          </Typography>
          <Button
            variant="text"
            color="error"
            size="small"
            onClick={logout}
            sx={{ mt: 0.5, p: 0, minWidth: 0 }}
          >
            Sair
          </Button>
        </Box>
      )}
      {collapsed && (
        <Button
          variant="text"
          color="error"
          size="small"
          onClick={logout}
          sx={{ mt: 1, p: 0, minWidth: 0 }}
        >
          Sair
        </Button>
      )}
    </Box>
  );
};

const LayoutSidebar: React.FC<SidebarProps> = ({
  collapsed,
  menuGroups,
  onClose,
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
        zIndex: 1300, // Maior que o header para passar por cima
        "& .MuiDrawer-paper": {
          width: isExpanded ? drawerWidth : collapsedWidth,
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: "width 0.15s ease",
          bgcolor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          alignItems: isExpanded ? "flex-start" : "center",
          position: "fixed",
          height: "100vh",
          top: 0,
          left: 0,
        },
      }}
    >
      <Toolbar
        sx={{
          minHeight: 64,
          display: "flex",
          justifyContent: isExpanded ? "flex-end" : "center",
          alignItems: "center",
          px: isExpanded ? 2 : 1,
          width: "100%",
        }}
      >
        {!collapsed && onClose && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
              ml: "auto",
            }}
          >
            <CloseIcon />
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
            <Box sx={{ px: 2, py: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {group.title}
              </Typography>
            </Box>
          )}
          <List
            sx={{
              width: "100%",
              p: 0,
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
                  width: "100%",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    justifyContent: "center",
                    marginRight: isExpanded ? 2 : 0,
                  }}
                >
                  {icon}
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText
                    primary={label}
                    sx={{ flexGrow: 1, minWidth: 0 }}
                  />
                )}
              </ListItemButton>
            ))}
          </List>
          {groupIndex < menuGroups.length - 1 && isExpanded && (
            <Divider sx={{ my: 1 }} />
          )}
        </React.Fragment>
      ))}
    </Box>
    <UserBox collapsed={!isExpanded} />
  </Drawer>
  );
};

export default LayoutSidebar;
