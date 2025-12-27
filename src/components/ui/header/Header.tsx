import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNavigate } from "react-router";
import logoDesenvolve from "../../../assets/images/logo/LOGO DESENVOLVE.png";
import { APP_ROUTES } from "../../../util/constants";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoClick = () => {
    navigate(APP_ROUTES.DASHBOARD);
  };

  const handleProfileClick = () => {
    navigate(APP_ROUTES.MY_PROFILE);
    handleMenuClose();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "#FFFFFF",
        color: "#4A4A4A",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        width: "100%",
        zIndex: 1100, // Menor que o sidebar para ficar abaixo
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{
              color: "#4A4A4A",
              "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              component="img"
              src={logoDesenvolve}
              alt="Desenvolve"
              onClick={handleLogoClick}
              sx={{
                width: { xs: 140, sm: 160, md: 180 },
                height: "auto",
                cursor: "pointer",
                transition: "opacity 0.2s",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            />
          </Box>
        </Box>

        {/* Perfil com dropdown */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0.5,
              "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#4A4A4A",
                fontSize: 16,
              }}
            >
              <AccountCircleIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <KeyboardArrowDownIcon
              sx={{ fontSize: 16, color: "#4A4A4A", ml: 0.5 }}
            />
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
          >
            <MenuItem onClick={handleProfileClick}>Meu Perfil</MenuItem>
            <MenuItem onClick={handleMenuClose}>Sair</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

