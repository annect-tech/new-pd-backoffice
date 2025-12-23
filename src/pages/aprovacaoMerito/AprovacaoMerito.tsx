import React, { useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
  Alert,
} from "@mui/material";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useAcademicMerit } from "../../hooks/useAcademicMerit";
import { APP_ROUTES } from "../../util/constants";

const AprovacaoMerito: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    actionLoading,
    count,
    currentIndex,
    currentMerit,
    approveCurrent,
    recuseCurrent,
    next,
    prev,
    fetchMerits,
  } = useAcademicMerit();

  useEffect(() => {
    fetchMerits();
  }, [fetchMerits]);

  if (loading) {
    return (
      <Box p={2}>
        <Breadcrumbs
          aria-label="breadcrumb"
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate(APP_ROUTES.DASHBOARD)}
            sx={{
              color: "#A650F0",
              textDecoration: "none",
              cursor: "pointer",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Dashboard
          </Link>
          <Typography color="text.primary">Aprovação Mérito</Typography>
        </Breadcrumbs>
        <Box
          sx={{
            height: "80vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Breadcrumbs
          aria-label="breadcrumb"
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate(APP_ROUTES.DASHBOARD)}
            sx={{
              color: "#A650F0",
              textDecoration: "none",
              cursor: "pointer",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Dashboard
          </Link>
          <Typography color="text.primary">Aprovação Mérito</Typography>
        </Breadcrumbs>
        <Alert severity="error" sx={{ p: 4 }}>
          Erro: {error}
        </Alert>
      </Box>
    );
  }

  if (count === 0 || !currentMerit) {
    return (
      <Box p={2}>
        <Breadcrumbs
          aria-label="breadcrumb"
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate(APP_ROUTES.DASHBOARD)}
            sx={{
              color: "#A650F0",
              textDecoration: "none",
              cursor: "pointer",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Dashboard
          </Link>
          <Typography color="text.primary">Aprovação Mérito</Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              color: "#A650F0",
              fontWeight: 600,
              mb: 2,
            }}
          >
            Aprovação Mérito
          </Typography>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              backgroundColor: "#F3E5F5",
              borderRadius: 2,
              borderLeft: "4px solid #A650F0",
            }}
          >
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Aprovação Mérito</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Esta página permite gerenciar e validar os DOCUMENTOS DE MÉRITO ACADÊMICO dos candidatos.
              Visualize cada documento PDF, analise as informações do candidato e aprove ou reprove os documentos
              pendentes de validação. Utilize os botões de navegação para percorrer os documentos e os botões
              de ação para tomar decisões sobre cada documento.
            </Typography>
          </Paper>
        </Box>

        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" color="text.primary">
            Não há documentos pendentes para avaliação.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box p={2}>
      {/* Breadcrumb */}
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(APP_ROUTES.DASHBOARD)}
          sx={{
            color: "#A650F0",
            textDecoration: "none",
            cursor: "pointer",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          Dashboard
        </Link>
        <Typography color="text.primary">Aprovação Mérito</Typography>
      </Breadcrumbs>

      {/* Título e Texto Explicativo */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            color: "#A650F0",
            fontWeight: 600,
            mb: 2,
          }}
        >
          Aprovação Mérito
        </Typography>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            backgroundColor: "#F3E5F5",
            borderRadius: 2,
            borderLeft: "4px solid #A650F0",
          }}
        >
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Aprovação Mérito</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta página permite gerenciar e validar os DOCUMENTOS DE MÉRITO ACADÊMICO dos candidatos.
            Visualize cada documento PDF, analise as informações do candidato e aprove ou reprove os documentos
            pendentes de validação. Utilize os botões de navegação para percorrer os documentos e os botões
            de ação para tomar decisões sobre cada documento.
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ display: "flex", height: "calc(75vh - 200px)", gap: 2 }}>
        {/* Visualizador PDF */}
        <Paper
          elevation={2}
          sx={{
            flex: "0 0 60%",
            overflow: "hidden",
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              p: 2,
              backgroundColor: "#A650F0",
              color: "#FFFFFF",
              fontWeight: 600,
            }}
          >
            <Typography variant="subtitle1">Visualizador de Documento</Typography>
          </Box>
          <Box sx={{ flex: 1, position: "relative" }}>
            <iframe
              src={currentMerit.document}
              title="Documento de Mérito"
              width="100%"
              height="100%"
              style={{ border: "none" }}
              onError={(e) => {
                console.error("Erro ao carregar PDF:", e);
              }}
            />
          </Box>
        </Paper>

        {/* Painel de validação */}
        <Paper
          elevation={2}
          sx={{
            width: 320,
            p: 2,
            display: "flex",
            flexDirection: "column",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#A650F0", fontWeight: 600 }}
          >
            Documento {currentIndex + 1} de {count}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
            ID:
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
            {currentMerit.id}
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Aluno:
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
            {`${currentMerit.user_data_display.user.first_name} ${currentMerit.user_data_display.user.last_name}`}
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Criado em:
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
            {new Date(currentMerit.created_at).toLocaleString("pt-BR")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
              gap: 1,
            }}
          >
            <Button
              variant="outlined"
              disabled={currentIndex === 0}
              onClick={prev}
              sx={{
                borderColor: "#A650F0",
                color: "#A650F0",
                "&:hover": {
                  borderColor: "#8B3DD9",
                  backgroundColor: "#F3E5F5",
                },
                "&:disabled": {
                  borderColor: "#ccc",
                  color: "#ccc",
                },
              }}
            >
              Anterior
            </Button>
            <Button
              variant="outlined"
              disabled={currentIndex === count - 1}
              onClick={next}
              sx={{
                borderColor: "#A650F0",
                color: "#A650F0",
                "&:hover": {
                  borderColor: "#8B3DD9",
                  backgroundColor: "#F3E5F5",
                },
                "&:disabled": {
                  borderColor: "#ccc",
                  color: "#ccc",
                },
              }}
            >
              Próximo
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Button
            variant="contained"
            color="success"
            fullWidth
            disabled={actionLoading}
            onClick={approveCurrent}
            sx={{
              mb: 1,
              bgcolor: "#4CAF50",
              "&:hover": {
                bgcolor: "#45a049",
              },
              "&:disabled": {
                bgcolor: "#ccc",
              },
            }}
          >
            {actionLoading ? <CircularProgress size={20} /> : "Aprovar"}
          </Button>
          <Button
            variant="contained"
            color="error"
            fullWidth
            disabled={actionLoading}
            onClick={recuseCurrent}
            sx={{
              bgcolor: "#F44336",
              "&:hover": {
                bgcolor: "#da190b",
              },
              "&:disabled": {
                bgcolor: "#ccc",
              },
            }}
          >
            {actionLoading ? <CircularProgress size={20} /> : "Reprovar"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default AprovacaoMerito;

