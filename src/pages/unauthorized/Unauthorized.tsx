import React from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { APP_ROUTES } from "../../util/constants";
import PageHeader from "../../components/ui/page/PageHeader";
import { useNavigate } from "react-router";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 900, margin: "0 auto" }}>
      <PageHeader
        title="Não autorizado"
        subtitle="Você não tem permissão para acessar esta página."
        breadcrumbs={[
          { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
          { label: "Não autorizado" },
        ]}
      />

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Typography variant="body1" sx={{ color: "#4B5563", mb: 3, lineHeight: 1.7 }}>
          Se você acredita que isso é um erro, confirme se sua conta possui os papéis
          necessários (ex.: <strong>ADMIN</strong> ou <strong>ADMIN_MASTER</strong>).
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap">
          <Button variant="contained" onClick={() => navigate(APP_ROUTES.DASHBOARD)}>
            Voltar ao dashboard
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Unauthorized;

