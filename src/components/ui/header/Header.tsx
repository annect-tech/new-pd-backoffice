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
} from "@mui/material";
import { useNavigate } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import { APP_ROUTES } from "../../../util/constants";
import logoDesenvolve from "../../../assets/images/logo/LOGO DESENVOLVE.png";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
        bgcolor: "#FFFFFF",
        color: "#1F2937",
        boxShadow: "none",
        width: "100%",
        zIndex: 1100,
        borderBottom: "1px solid #F3F4F6",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 1, minHeight: 60 }}>
        {/* Logo */}
        <Box
          onClick={() => navigate(APP_ROUTES.DASHBOARD)}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            transition: "transform 0.2s ease, opacity 0.2s ease",
            "&:hover": {
              opacity: 0.85,
              transform: "scale(1.02)",
            },
          }}
        >
          <Box
            component="img"
            src={logoDesenvolve}
            alt="Desenvolve"
            sx={{
              height: 40,
              width: "auto",
            }}
          />
        </Box>

        {/* Perfil com dropdown */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              "&:hover": {
                bgcolor: "transparent",
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: "#E5E7EB",
                fontWeight: 500,
                fontSize: "0.875rem",
                color: "#9CA3AF",
              }}
            >
              {user?.first_name?.[0] || user?.email?.[0] || "U"}
            </Avatar>
            <Box sx={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "#1F2937",
                  fontSize: "0.875rem",
                  lineHeight: 1.2,
                }}
              >
                {user?.first_name || user?.email || "Usuário"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#6B7280",
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
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  border: "1px solid #E5E7EB",
                  bgcolor: "#F9FAFB",
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
                color: "#000000",
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
                color: "#000000",
              }}
            >
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

