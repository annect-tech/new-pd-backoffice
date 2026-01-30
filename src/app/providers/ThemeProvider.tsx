import React, { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline, type PaletteMode } from "@mui/material";
import getTheme from "../../assets/styles/theme";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "pd-theme-mode";

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode deve ser usado dentro de ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Carrega o tema do localStorage ou usa 'light' como padrão
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedMode === "light" || savedMode === "dark") {
      return savedMode;
    }
    // Verifica preferência do sistema
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  // Salva no localStorage sempre que o modo mudar
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    // Atualiza o atributo data-theme no html para CSS
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  // Aplica o atributo data-theme no mount inicial
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, []);

  const toggleTheme = () => {
    setModeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const theme = useMemo(() => getTheme(mode as PaletteMode), [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleTheme,
      setMode,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
