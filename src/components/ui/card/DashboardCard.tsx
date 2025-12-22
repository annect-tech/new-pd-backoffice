import React, { useMemo } from "react";
import { Card, CardContent, Box, Typography } from "@mui/material";

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  isAdmin?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  onClick,
  isAdmin = false,
}) => {
  const cardColor = isAdmin ? "#6B7280" : "#A650F0"; // Cinza para admin, roxo para normal
  
  // Cores do gradiente
  // Cards normais: azul (topo) até roxo (embaixo)
  // Cards admin: laranja (topo) até roxo (embaixo)
  const startColor = isAdmin ? "#F97316" : "#3B82F6"; // Laranja para admin, azul para normal
  const endColor = isAdmin ? "#A650F0" : "#A650F0"; // Roxo embaixo para ambos
  
  // ID único para o gradiente
  const gradientId = useMemo(() => `gradient-${Math.random().toString(36).substr(2, 9)}`, []);
  return (
    <Card
      sx={{
        width: "100%",
        height: 160,
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s ease",
        bgcolor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
        margin: 0,
        transform: "scale(1)",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: isAdmin
            ? "0 4px 12px rgba(107, 114, 128, 0.2)"
            : "0 4px 12px rgba(166, 80, 240, 0.2)",
          zIndex: 10,
        },
      }}
      onClick={onClick}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 2,
          px: 2,
          height: "100%",
          width: "100%",
          boxSizing: "border-box",
          "&:last-child": {
            paddingBottom: 2,
          },
        }}
      >
        <Box
          sx={{
            mb: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            height: 40,
            position: "relative",
            "& svg": {
              fill: `url(#${gradientId})`,
            },
          }}
        >
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={startColor} />
                <stop offset="100%" stopColor={endColor} />
              </linearGradient>
            </defs>
          </svg>
          {icon}
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: cardColor,
            fontWeight: 500,
            textAlign: "center",
            fontSize: "0.9rem",
            lineHeight: 1.3,
            wordBreak: "break-word",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            flexShrink: 0,
            maxHeight: "2.6em",
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;

