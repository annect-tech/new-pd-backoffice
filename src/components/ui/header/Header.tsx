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
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import { APP_ROUTES } from "../../../util/constants";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
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
        {/* Menu Toggle */}
        <Box sx={{ display: "flex", alignItems: "center" }}>

        </Box>

        {/* Perfil com dropdown */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0.5,
              "&:hover": {
                bgcolor: "transparent",
              },
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                background: "#E5E7EB",
                fontWeight: 500,
                fontSize: "0.75rem",
                color: "#9CA3AF",
              }}
            >
              {user?.first_name?.[0] || user?.email[0]}
            </Avatar>
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
                color: "#6B7280",
                "&:hover": {
                  bgcolor: "#F9FAFB",
                },
              }}
            >
              Perfil
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 0.75,
                px: 2,
                fontSize: "0.8125rem",
                color: "#6B7280",
                "&:hover": {
                  bgcolor: "#F9FAFB",
                },
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

