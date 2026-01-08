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
  const cardColor = isAdmin ? "#1F2937" : "#1F2937";

  // Cores do gradiente
  const startColor = isAdmin ? "#F97316" : "#3B82F6";
  const endColor = isAdmin ? "#A650F0" : "#A650F0";

  // ID único para o gradiente
  const gradientId = useMemo(() => `gradient-${Math.random().toString(36).substring(2, 11)}`, []);

  return (
    <Card
      sx={{
        width: "100%",
        height: 130,
        borderRadius: 2.5,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        bgcolor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
        margin: 0,
        border: "1px solid rgba(0,0,0,0.06)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: isAdmin
            ? "linear-gradient(90deg, #F97316 0%, #A650F0 100%)"
            : "linear-gradient(90deg, #3B82F6 0%, #A650F0 100%)",
          opacity: 0,
          transition: "opacity 0.3s ease",
        },
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          borderColor: "rgba(0,0,0,0.1)",
          "&::before": {
            opacity: 1,
          },
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
          px: 1.5,
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
            mb: 1.2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
            "& svg": {
              fontSize: "36px !important",
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
            fontWeight: 600,
            textAlign: "center",
            fontSize: "0.8rem",
            lineHeight: 1.25,
            wordBreak: "break-word",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            flexShrink: 0,
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;

