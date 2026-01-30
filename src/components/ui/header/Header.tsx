import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useNavigate } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import { useThemeMode } from "../../../app/providers/ThemeProvider";
import { APP_ROUTES } from "../../../util/constants";
import logoDesenvolve from "../../../assets/images/logo/LOGO DESENVOLVE.png";

interface HeaderProps {
  onMenuClick?: () => void;
  sidebarCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate(APP_ROUTES.MY_PROFILE);
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate(APP_ROUTES.LOGIN);
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: (theme) => theme.palette.mode === "dark" ? "#1E1E1E" : "#FFFFFF",
        color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
        boxShadow: "none",
        width: "100%",
        zIndex: 1100,
        borderBottom: (theme) => theme.palette.mode === "dark" 
          ? "1px solid rgba(255, 255, 255, 0.1)" 
          : "1px solid #F3F4F6",
        transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 0, px: 2, minHeight: 72, height: 72 }}>
        {/* Logo à esquerda */}
        <Box
          onClick={() => navigate(APP_ROUTES.DASHBOARD)}
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            pl: 3,
            cursor: "pointer",
            transition: "opacity 0.2s ease",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          <img
            src={logoDesenvolve}
            alt="Logo Desenvolve"
            style={{
              height: "32px",
              objectFit: "contain",
            }}
          />
        </Box>

        {/* Elementos à direita */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Toggle de tema */}
        <Tooltip title={mode === "dark" ? "Tema claro" : "Tema escuro"}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              mr: 1,
              color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
              "&:hover": {
                bgcolor: (theme) => theme.palette.mode === "dark" 
                  ? "rgba(255, 255, 255, 0.05)" 
                  : "rgba(0, 0, 0, 0.02)",
              },
            }}
          >
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>

          {/* Perfil com dropdown */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              borderRadius: 2,
              "&:hover": {
                bgcolor: (theme) => theme.palette.mode === "dark" 
                  ? "rgba(255, 255, 255, 0.05)" 
                  : "rgba(0, 0, 0, 0.02)",
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: (theme) => theme.palette.mode === "dark" ? "#3C3C3C" : "#E5E7EB",
                fontWeight: 500,
                fontSize: "0.875rem",
                color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#9CA3AF",
              }}
            >
              {user?.first_name?.[0] || user?.email?.[0] || "U"}
            </Avatar>
            <Box sx={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: (theme) => theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                  fontSize: "0.875rem",
                  lineHeight: 1.2,
                }}
              >
                {user?.first_name || user?.email || "Usuário"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: (theme) => theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                  fontSize: "0.75rem",
                  lineHeight: 1.2,
                }}
              >
                {user?.email || ""}
              </Typography>
            </Box>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
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
                "&:hover": {
                  bgcolor: (theme) => theme.palette.mode === "dark" 
                    ? "rgba(255, 255, 255, 0.08)" 
                    : "rgba(0, 0, 0, 0.04)",
                },
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
                "&:hover": {
                  bgcolor: (theme) => theme.palette.mode === "dark" 
                    ? "rgba(255, 255, 255, 0.08)" 
                    : "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              Sair
            </MenuItem>
          </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

