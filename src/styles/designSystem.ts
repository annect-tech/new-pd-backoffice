// Design System - Paleta de cores e estilos padronizados

export const designSystem = {
  colors: {
    primary: {
      main: "#A650F0",
      dark: "#9333EA",
      darker: "#8B3DD9",
      light: "#C084FC",
      lighter: "#F3E8FF",
      lightest: "#FAF5FF",
    },
    text: {
      primary: "#1F2937",
      secondary: "#374151",
      tertiary: "#4B5563",
      disabled: "#6B7280",
      hint: "#9CA3AF",
      // Dark mode
      primaryDark: "#FFFFFF",
      secondaryDark: "#B0B0B0",
      tertiaryDark: "#9E9E9E",
      disabledDark: "#7A7A7A",
      hintDark: "#6B7280",
    },
    background: {
      primary: "#FFFFFF",
      secondary: "#F9FAFB",
      tertiary: "#F3F4F6",
      // Dark mode
      primaryDark: "#1E1E1E",
      secondaryDark: "#2C2C2C",
      tertiaryDark: "#3C3C3C",
    },
    border: {
      main: "#E5E7EB",
      light: "#D1D5DB",
      dark: "#9CA3AF",
      // Dark mode
      mainDark: "rgba(255, 255, 255, 0.1)",
      lightDark: "rgba(255, 255, 255, 0.15)",
      darkDark: "rgba(255, 255, 255, 0.2)",
    },
    success: {
      main: "#10B981",
      light: "#D1FAE5",
    },
    error: {
      main: "#EF4444",
      light: "#FEE2E2",
    },
    warning: {
      main: "#F59E0B",
      light: "#FEF3C7",
    },
    info: {
      main: "#3B82F6",
      light: "#DBEAFE",
    },
  },
  gradients: {
    primary: "linear-gradient(90deg, #A650F0 0%, #C084FC 100%)",
    secondary: "linear-gradient(90deg, #3B82F6 0%, #A650F0 50%, transparent 100%)",
    admin: "linear-gradient(90deg, #F97316 0%, #A650F0 50%, transparent 100%)",
  },
  borderRadius: {
    small: 2,
    medium: 3,
    large: 5,
  },
  spacing: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  },
  shadows: {
    small: "0 1px 3px rgba(0,0,0,0.04)",
    medium: "0 4px 12px rgba(0,0,0,0.1)",
    large: "0 10px 40px rgba(0,0,0,0.1)",
    // Dark mode
    smallDark: "0 1px 3px rgba(0,0,0,0.3)",
    mediumDark: "0 4px 12px rgba(0,0,0,0.4)",
    largeDark: "0 10px 40px rgba(0,0,0,0.5)",
  },
  transitions: {
    fast: "0.2s ease",
    medium: "0.3s ease",
    slow: "0.5s ease",
  },
};

// Estilos comuns de Paper/Card
export const paperStyles = {
  elevation: 0,
  sx: {
    borderRadius: 3,
    overflow: "hidden",
    border: (theme) => `1px solid ${theme.palette.mode === "dark" 
      ? designSystem.colors.border.mainDark 
      : designSystem.colors.border.main}`,
    boxShadow: (theme) => theme.palette.mode === "dark" 
      ? designSystem.shadows.smallDark 
      : designSystem.shadows.small,
  },
};

// Estilos de Toolbar
export const toolbarStyles = {
  sx: {
    display: "flex",
    justifyContent: "space-between",
    gap: 2,
    p: 3,
    backgroundColor: (theme) => theme.palette.mode === "dark" 
      ? designSystem.colors.background.secondaryDark 
      : designSystem.colors.background.primary,
    borderBottom: (theme) => `1px solid ${theme.palette.mode === "dark" 
      ? designSystem.colors.border.mainDark 
      : designSystem.colors.border.main}`,
  },
};

// Estilos de TableHead
export const tableHeadStyles = {
  sx: {
    // match Seletivo visual: soft background, darker text, slightly larger border
    backgroundColor: (theme) => theme.palette.mode === "dark" 
      ? designSystem.colors.background.secondaryDark 
      : "#F9FAFB",
    color: (theme) => theme.palette.mode === "dark" 
      ? designSystem.colors.text.secondaryDark 
      : "#374151",
    fontWeight: 600,
    borderBottom: (theme) => `2px solid ${theme.palette.mode === "dark" 
      ? designSystem.colors.border.mainDark 
      : designSystem.colors.border.main}`,
    fontSize: "0.875rem",
  },
};

// Estilos de TableRow com hover
export const tableRowHoverStyles = {
  hover: true,
  sx: {
    // alternate row backgrounds and hover color to match Seletivo
    "&:nth-of-type(odd)": {
      backgroundColor: (theme) => theme.palette.mode === "dark" 
        ? designSystem.colors.background.secondaryDark 
        : "#FFFFFF",
    },
    "&:nth-of-type(even)": {
      backgroundColor: (theme) => theme.palette.mode === "dark" 
        ? designSystem.colors.background.tertiaryDark 
        : "#F9FAFB",
    },
    "&:hover": {
      backgroundColor: (theme) => theme.palette.mode === "dark" 
        ? "rgba(166, 80, 240, 0.15) !important" 
        : "#FAF5FF !important",
    },
    transition: `background-color ${designSystem.transitions.fast}`,
  },
};

// Estilos de IconButton
export const iconButtonStyles = {
  sx: {
    color: (theme) => theme.palette.mode === "dark" 
      ? designSystem.colors.text.disabledDark 
      : designSystem.colors.text.disabled,
    "&:hover": {
      backgroundColor: (theme) => theme.palette.mode === "dark" 
        ? "rgba(166, 80, 240, 0.15)" 
        : designSystem.colors.primary.lightest,
      color: designSystem.colors.primary.main,
    },
  },
};

// Estilos de TextField
export const textFieldStyles = {
  sx: {
    "& .MuiInput-underline:before": {
      borderBottomColor: (theme) => theme.palette.mode === "dark" 
        ? designSystem.colors.border.lightDark 
        : designSystem.colors.border.light,
    },
    "& .MuiInput-underline:hover:before": {
      borderBottomColor: (theme) => theme.palette.mode === "dark" 
        ? designSystem.colors.border.darkDark 
        : designSystem.colors.border.dark,
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: designSystem.colors.primary.main,
    },
    "& input": {
      color: (theme) => theme.palette.mode === "dark" 
        ? designSystem.colors.text.primaryDark 
        : designSystem.colors.text.primary,
    },
  },
};

// Estilos de Button primário
export const primaryButtonStyles = {
  variant: "contained" as const,
  sx: {
    backgroundColor: designSystem.colors.primary.main,
    color: "#FFFFFF",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: designSystem.colors.primary.dark,
    },
    transition: `all ${designSystem.transitions.fast}`,
  },
};

// Estilos de Dialog
export const dialogStyles = {
  slotProps: {
    paper: {
      sx: {
        borderRadius: 3,
      },
    },
  },
};

// Estilos de CircularProgress
export const progressStyles = {
  sx: {
    color: designSystem.colors.primary.main,
  },
};

// Estilos de TablePagination
export const tablePaginationStyles = {
  sx: {
    borderTop: (theme) => `1px solid ${theme.palette.mode === "dark" 
      ? designSystem.colors.border.mainDark 
      : designSystem.colors.border.main}`,
    backgroundColor: (theme) => theme.palette.mode === "dark" 
      ? designSystem.colors.background.secondaryDark 
      : designSystem.colors.background.secondary,
  },
};

// Estilos padronizados para DataGrid (para usar em Contratos, Documentos, etc)
export const dataGridStyles = {
  border: "none",
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: (theme) => theme.palette.mode === "dark" 
      ? designSystem.colors.background.secondaryDark 
      : designSystem.colors.background.secondary,
    color: (theme) => theme.palette.mode === "dark" 
      ? designSystem.colors.text.secondaryDark 
      : designSystem.colors.text.secondary,
    borderBottom: (theme) => `2px solid ${theme.palette.mode === "dark" 
      ? designSystem.colors.border.mainDark 
      : designSystem.colors.border.main}`,
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: 600,
      fontSize: "0.875rem",
    },
  },
  "& .MuiDataGrid-row": {
    "&:nth-of-type(odd)": {
      backgroundColor: (theme) => theme.palette.mode === "dark" 
        ? designSystem.colors.background.secondaryDark 
        : designSystem.colors.background.primary,
    },
    "&:nth-of-type(even)": {
      backgroundColor: (theme) => theme.palette.mode === "dark" 
        ? designSystem.colors.background.tertiaryDark 
        : designSystem.colors.background.secondary,
    },
    "&:hover": {
      backgroundColor: (theme) => theme.palette.mode === "dark" 
        ? "rgba(166, 80, 240, 0.15) !important" 
        : `${designSystem.colors.primary.lightest} !important`,
      cursor: "pointer",
    },
  },
  "& .MuiDataGrid-cell": {
    borderBottom: (theme) => `1px solid ${theme.palette.mode === "dark" 
      ? designSystem.colors.border.mainDark 
      : designSystem.colors.border.main}`,
    fontSize: "0.875rem",
    color: (theme) => theme.palette.mode === "dark" 
      ? designSystem.colors.text.secondaryDark 
      : designSystem.colors.text.secondary,
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: (theme) => `1px solid ${theme.palette.mode === "dark" 
      ? designSystem.colors.border.mainDark 
      : designSystem.colors.border.main}`,
    backgroundColor: (theme) => theme.palette.mode === "dark" 
      ? designSystem.colors.background.secondaryDark 
      : designSystem.colors.background.secondary,
  },
};
