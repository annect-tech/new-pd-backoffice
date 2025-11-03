import { createTheme, type PaletteMode } from "@mui/material";

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#0052CC",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#172B4D",
        contrastText: "#FFFFFF",
      },
      info: {
        main: "#00B8D9",
        contrastText: "#FFFFFF",
      },
      success: {
        main: "#36B37E",
        contrastText: "#FFFFFF",
      },
      warning: {
        main: "#FFAB00",
        contrastText: "#000000",
      },
      error: {
        main: "#FF5630",
        contrastText: "#FFFFFF",
      },
      grey: {
        50: "#F5F5F5",
        100: "#E8E8E8",
        200: "#B3B3B3",
        300: "#9E9E9E",
        400: "#7A7A7A",
        500: "#4A4A4A",
      },
      background: {
        default: mode === "dark" ? "#1E1E1E" : "#F5F5F5",
        paper: mode === "dark" ? "#2C2C2C" : "#E8E8E8",
      },
      text: {
        primary: mode === "dark" ? "#FFFFFF" : "#000000",
        secondary: mode === "dark" ? "#B0B0B0" : "#666666",
        disabled: mode === "dark" ? "#7A7A7A" : "#B0B0B0",
      },
    },
    typography: {
      fontFamily: "Ubuntu, sans-serif",
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 500 },
      h4: { fontWeight: 500 },
      h5: { fontWeight: 400 },
      h6: { fontWeight: 400 },
      body1: { fontWeight: 300 },
      body2: { fontWeight: 300 },
    },
  });

export default getTheme;
