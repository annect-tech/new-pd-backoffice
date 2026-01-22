
import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { Link, useNavigate } from "react-router";
import logoAberta from "../../../assets/images/logo/logo aberta.png";
import logoFechada from "../../../assets/images/logo/logo fechada.png";
import { APP_ROUTES } from "../../../util/constants";
import { designSystem } from "../../../styles/designSystem";
import { useAuth } from "../../../hooks/useAuth";
import { useThemeMode } from "../../../app/providers/ThemeProvider";

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
  onClose,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate(APP_ROUTES.MY_PROFILE);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
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
      <Toolbar
        sx={{
          minHeight: 72,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 0,
          width: "100%",
          backgroundColor: (theme) => theme.palette.mode === "dark" ? "#1E1E1E" : "#FFFFFF",
          borderBottom: (theme) => theme.palette.mode === "dark" 
            ? "1px solid rgba(255, 255, 255, 0.1)" 
            : "1px solid rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Logo */}
        <Box
          onClick={handleLogoClick}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            width: collapsedWidth,
            flexShrink: 0,
            pl: -0.2,
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
              src={logoAberta}
              alt="Desenvolve"
              sx={{
                width: 32,
                height: "auto",
              }}
            />
          ) : (
            <Box
              component="img"
              src={logoFechada}
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
              color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#9CA3AF",
              transition: "all 0.2s ease",
              "&:hover": {
                color: designSystem.colors.primary.main,
                backgroundColor: (theme) => theme.palette.mode === "dark" 
                  ? "rgba(166, 80, 240, 0.15)" 
                  : "rgba(166, 80, 240, 0.08)",
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
        overflowY: isExpanded ? "auto" : "hidden",
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
              alignItems: "flex-start",
            }}
          >
            {group.menus.map(({ icon, label, to }) => (
              <ListItemButton
                key={to}
                component={Link}
                to={to}
                sx={{
                  justifyContent: "flex-start",
                  px: 1,
                  py: 1.5,
                  width: "100%",
                  borderRadius: 2,
                  mb: 0.5,
                  color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
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
                    backgroundColor: designSystem.colors.primary.main,
                    borderRadius: "0 4px 4px 0",
                    transition: "height 0.2s ease",
                  },
                  "&:hover": {
                    color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                    backgroundColor: (theme) => theme.palette.mode === "dark" 
                      ? "rgba(166, 80, 240, 0.15)" 
                      : "rgba(166, 80, 240, 0.06)",
                    transform: "translateX(2px)",
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
                    minWidth: collapsedWidth - 16,
                    width: collapsedWidth - 16,
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

    {/* Toggle de tema */}
    <Box
      sx={{
        width: "100%",
        borderTop: (theme) => `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)"}`,
        py: 1.5,
        px: isExpanded ? 2 : 1,
        display: "flex",
        justifyContent: isExpanded ? "flex-start" : "center",
        alignItems: "center",
      }}
    >
      <Tooltip title={mode === "dark" ? "Tema claro" : "Tema escuro"}>
        <Box
          component="button"
          onClick={toggleTheme}
          sx={{
            width: isExpanded ? "100%" : "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: isExpanded ? "flex-start" : "center",
            px: isExpanded ? 2 : 1,
            py: 1.5,
            borderRadius: 2,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: (theme) => theme.palette.mode === "dark" 
                ? "rgba(166, 80, 240, 0.15)" 
                : "rgba(166, 80, 240, 0.06)",
              color: designSystem.colors.primary.main,
              transform: "translateX(2px)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 0,
              marginRight: isExpanded ? 2.5 : 0,
              color: "inherit",
              fontSize: "1.25rem",
            }}
          >
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </Box>
          {isExpanded && (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: "0.875rem",
                color: "inherit",
              }}
            >
              {mode === "dark" ? "Tema Claro" : "Tema Escuro"}
            </Typography>
          )}
        </Box>
      </Tooltip>
    </Box>

    {/* Avatar do usuário no final da sidebar */}
    <Box
      sx={{
        width: "100%",
        borderTop: (theme) => `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)"}`,
        py: 2,
        px: isExpanded ? 2 : 1,
        display: "flex",
        justifyContent: isExpanded ? "flex-start" : "center",
        alignItems: "center",
      }}
    >
      <IconButton
        onClick={handleMenuOpen}
        sx={{
          p: 0,
          width: isExpanded ? "100%" : "auto",
          justifyContent: isExpanded ? "flex-start" : "center",
          "&:hover": {
            bgcolor: "transparent",
          },
        }}
      >
        <Avatar
          sx={{
            width: isExpanded ? 40 : 36,
            height: isExpanded ? 40 : 36,
            background: (theme) => theme.palette.mode === "dark" ? "#3C3C3C" : "#E5E7EB",
            fontWeight: 500,
            fontSize: isExpanded ? "0.875rem" : "0.75rem",
            color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#9CA3AF",
            mr: isExpanded ? 2 : 0,
          }}
        >
          {user?.first_name?.[0] || user?.email?.[0] || "U"}
        </Avatar>
        {isExpanded && (
          <Box sx={{ flex: 1, textAlign: "left" }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                fontSize: "0.875rem",
              }}
            >
              {user?.first_name || user?.email || "Usuário"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                fontSize: "0.75rem",
              }}
            >
              {user?.email || ""}
            </Typography>
          </Box>
        )}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: isExpanded ? "right" : "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: isExpanded ? "right" : "left",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 140,
              borderRadius: 1,
              boxShadow: (theme) => theme.palette.mode === "dark" 
                ? "0 1px 3px rgba(0,0,0,0.3)" 
                : "0 1px 3px rgba(0,0,0,0.08)",
              border: (theme) => theme.palette.mode === "dark" 
                ? "1px solid rgba(255, 255, 255, 0.1)" 
                : "1px solid #E5E7EB",
              bgcolor: (theme) => theme.palette.mode === "dark" ? "#2C2C2C" : "#F9FAFB",
            },
          },
        }}
      >
        <MenuItem
          onClick={handleProfileClick}
          sx={{
            py: 0.75,
            px: 2,
            fontSize: "0.8125rem",
            color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#000000",
          }}
        >
          Meu Perfil
        </MenuItem>
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 0.75,
            px: 2,
            fontSize: "0.8125rem",
            color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#000000",
          }}
        >
          Sair
        </MenuItem>
      </Menu>
    </Box>
  </Drawer>
  );
};

export default LayoutSidebar;
