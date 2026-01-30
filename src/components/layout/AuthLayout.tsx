import React, { type ReactNode } from "react";
import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useThemeMode } from "../../app/providers/ThemeProvider";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100%",
        px: 2,
        py: 4,
        boxSizing: "border-box",
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box sx={{ position: "absolute", top: 24, right: 32, zIndex: 10 }}>
        <Tooltip title={mode === "dark" ? "Tema claro" : "Tema escuro"}>
          <IconButton color="primary" onClick={toggleTheme}>
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
      </Box>
      {children}
    </Box>
  );
};

export default AuthLayout;
