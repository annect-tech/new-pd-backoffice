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
    },
    background: {
      primary: "#FFFFFF",
      secondary: "#F9FAFB",
      tertiary: "#F3F4F6",
    },
    border: {
      main: "#E5E7EB",
      light: "#D1D5DB",
      dark: "#9CA3AF",
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
    border: `1px solid ${designSystem.colors.border.main}`,
    boxShadow: designSystem.shadows.small,
  },
};

// Estilos de Toolbar
export const toolbarStyles = {
  sx: {
    display: "flex",
    justifyContent: "space-between",
    gap: 2,
    p: 3,
    backgroundColor: designSystem.colors.background.primary,
    borderBottom: `1px solid ${designSystem.colors.border.main}`,
  },
};

// Estilos de TableHead
export const tableHeadStyles = {
  sx: {
    // match Seletivo visual: soft background, darker text, slightly larger border
    backgroundColor: "#F9FAFB",
    color: "#374151",
    fontWeight: 600,
    borderBottom: `2px solid ${designSystem.colors.border.main}`,
    fontSize: "0.875rem",
  },
};

// Estilos de TableRow com hover
export const tableRowHoverStyles = {
  hover: true,
  sx: {
    // alternate row backgrounds and hover color to match Seletivo
    "&:nth-of-type(odd)": {
      backgroundColor: "#FFFFFF",
    },
    "&:nth-of-type(even)": {
      backgroundColor: "#F9FAFB",
    },
    "&:hover": {
      backgroundColor: "#FAF5FF !important",
    },
    transition: `background-color ${designSystem.transitions.fast}`,
  },
};

// Estilos de IconButton
export const iconButtonStyles = {
  sx: {
    color: designSystem.colors.text.disabled,
    "&:hover": {
      backgroundColor: designSystem.colors.primary.lightest,
      color: designSystem.colors.primary.main,
    },
  },
};

// Estilos de TextField
export const textFieldStyles = {
  sx: {
    "& .MuiInput-underline:before": {
      borderBottomColor: designSystem.colors.border.light,
    },
    "& .MuiInput-underline:hover:before": {
      borderBottomColor: designSystem.colors.border.dark,
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: designSystem.colors.primary.main,
    },
    "& input": {
      color: designSystem.colors.text.primary,
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
    borderTop: `1px solid ${designSystem.colors.border.main}`,
    backgroundColor: designSystem.colors.background.secondary,
  },
};

// Estilos padronizados para DataGrid (para usar em Contratos, Documentos, etc)
export const dataGridStyles = {
  border: "none",
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: designSystem.colors.background.secondary, // #F9FAFB - igual ao Seletivo
    color: designSystem.colors.text.secondary, // #374151
    borderBottom: `2px solid ${designSystem.colors.border.main}`,
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: 600,
      fontSize: "0.875rem",
    },
  },
  "& .MuiDataGrid-row": {
    "&:nth-of-type(odd)": {
      backgroundColor: designSystem.colors.background.primary, // #FFFFFF
    },
    "&:nth-of-type(even)": {
      backgroundColor: designSystem.colors.background.secondary, // #F9FAFB
    },
    "&:hover": {
      backgroundColor: `${designSystem.colors.primary.lightest} !important`, // #FAF5FF - hover roxo
      cursor: "pointer",
    },
  },
  "& .MuiDataGrid-cell": {
    borderBottom: `1px solid ${designSystem.colors.border.main}`,
    fontSize: "0.875rem",
    color: designSystem.colors.text.secondary,
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: `1px solid ${designSystem.colors.border.main}`,
    backgroundColor: designSystem.colors.background.secondary, // #F9FAFB - footer cinza
  },
};
