import React from "react";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Fade,
} from "@mui/material";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";
import { useNavigate } from "react-router";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  showInfoCard?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  breadcrumbs = [],
  showInfoCard = true,
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 5 }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Fade in timeout={600}>
          <Breadcrumbs
            aria-label="breadcrumb"
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 3 }}
          >
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;

              if (isLast) {
                return (
                  <Typography
                    key={index}
                    color="#1F2937"
                    fontWeight={500}
                  >
                    {item.label}
                  </Typography>
                );
              }

              return (
                <Link
                  key={index}
                  component="button"
                  variant="body1"
                  onClick={() => item.path && navigate(item.path)}
                  sx={{
                    color: "#9333EA",
                    textDecoration: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    "&:hover": {
                      color: "#A650F0",
                    },
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Fade>
      )}

      {/* Título e Subtítulo */}
      <Fade in timeout={800}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "#1F2937",
              mb: subtitle ? 1 : description ? 3 : 0,
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="body1"
              sx={{
                color: "#6B7280",
                fontSize: { xs: "0.95rem", sm: "1rem" },
                mb: description ? 3 : 0,
              }}
            >
              {subtitle}
            </Typography>
          )}

          {/* Card de Descrição */}
          {description && showInfoCard && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: "#F9FAFB",
                borderRadius: 3,
                border: "1px solid #E5E7EB",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: "linear-gradient(90deg, #A650F0 0%, #C084FC 100%)",
                },
              }}
            >
              <Typography variant="body2" color="#4B5563" sx={{ lineHeight: 1.7 }}>
                {description}
              </Typography>
            </Paper>
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default PageHeader;
