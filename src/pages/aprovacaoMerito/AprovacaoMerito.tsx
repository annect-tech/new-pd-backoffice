import React, { useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Alert,
  Fade,
  Snackbar,
} from "@mui/material";
import { useAcademicMerit } from "../../hooks/useAcademicMerit";
import { APP_ROUTES } from "../../util/constants";
import PageHeader from "../../components/ui/page/PageHeader";
import { designSystem, paperStyles, progressStyles } from "../../styles/designSystem";

const AprovacaoMerito: React.FC = () => {
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
    snackbar,
    closeSnackbar,
  } = useAcademicMerit();

  useEffect(() => {
    fetchMerits();
  }, [fetchMerits]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              maxWidth: 1400,
              width: "100%",
              margin: "0 auto",
            }}
          >
            <PageHeader
              title="Aprovação Mérito"
              subtitle="Valide os documentos de mérito acadêmico."
              breadcrumbs={[
                { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
                { label: "Aprovação Mérito" },
              ]}
              showInfoCard={false}
            />
            <Box
              sx={{
                height: "60vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress {...progressStyles} />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              maxWidth: 1400,
              width: "100%",
              margin: "0 auto",
            }}
          >
            <PageHeader
              title="Aprovação Mérito"
              subtitle="Valide os documentos de mérito acadêmico."
              breadcrumbs={[
                { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
                { label: "Aprovação Mérito" },
              ]}
              showInfoCard={false}
            />
            <Alert severity="error" sx={{ p: 4, borderRadius: 3 }}>
              Erro: {error}
            </Alert>
          </Box>
        </Box>
      </Box>
    );
  }

  if (count === 0 || !currentMerit) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              maxWidth: 1400,
              width: "100%",
              margin: "0 auto",
            }}
          >
            <PageHeader
              title="Aprovação Mérito"
              subtitle="Valide os documentos de mérito acadêmico."
              description="Esta página permite gerenciar e validar os DOCUMENTOS DE MÉRITO ACADÊMICO dos candidatos. Visualize cada documento PDF, analise as informações do candidato e aprove ou reprove os documentos pendentes de validação. Utilize os botões de navegação para percorrer os documentos e os botões de ação para tomar decisões sobre cada documento."
              breadcrumbs={[
                { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
                { label: "Aprovação Mérito" },
              ]}
            />

            <Fade in timeout={1000}>
              <Paper
                {...paperStyles}
                sx={{
                  ...paperStyles.sx,
                  p: 4,
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" color={designSystem.colors.text.primary}>
                  Não há documentos pendentes para avaliação.
                </Typography>
              </Paper>
            </Fade>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3, md: 4 },
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            maxWidth: 1400,
            width: "100%",
            margin: "0 auto",
          }}
        >
          <PageHeader
            title="Aprovação Mérito"
            subtitle="Valide os documentos de mérito acadêmico."
            description="Esta página permite gerenciar e validar os DOCUMENTOS DE MÉRITO ACADÊMICO dos candidatos. Visualize cada documento PDF, analise as informações do candidato e aprove ou reprove os documentos pendentes de validação. Utilize os botões de navegação para percorrer os documentos e os botões de ação para tomar decisões sobre cada documento."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Aprovação Mérito" },
            ]}
          />

          <Fade in timeout={1000}>
            <Box sx={{ display: "flex", height: "calc(75vh - 200px)", gap: 3 }}>
              {/* Visualizador PDF */}
              <Paper
                elevation={0}
                sx={{
                  flex: "0 0 65%",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  border: `1px solid ${designSystem.colors.border.main}`,
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                }}
              >
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    background: designSystem.gradients.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body1" fontWeight={600} color="#FFFFFF">
                    Documento de Mérito Acadêmico
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.25)",
                      px: 2,
                      py: 0.5,
                      borderRadius: 1.5,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} color="#FFFFFF">
                      {currentIndex + 1} / {count}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1, position: "relative", bgcolor: "#FAFAFA" }}>
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
                elevation={0}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  border: `1px solid ${designSystem.colors.border.main}`,
                  bgcolor: "#FFFFFF",
                  // permitir scroll quando o conteúdo for maior que o painel
                  overflow: "auto",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                }}
              >
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    borderBottom: `1px solid ${designSystem.colors.border.main}`,
                    bgcolor: designSystem.colors.background.secondary,
                  }}
                >
                  <Typography variant="body1" fontWeight={600} color={designSystem.colors.primary.main}>
                    Validação
                  </Typography>
                </Box>

                <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Info Card */}
                  <Box
                    sx={{
                      mb: 3,
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: designSystem.colors.primary.lightest,
                      border: `1px solid ${designSystem.colors.primary.lighter}`,
                    }}
                  >
                    <Box sx={{ mb: 2.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: designSystem.colors.primary.dark,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          fontSize: "0.7rem",
                        }}
                      >
                        ID do Documento
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: designSystem.colors.text.primary,
                          fontWeight: 600,
                          mt: 0.5,
                        }}
                      >
                        {currentMerit.id}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: designSystem.colors.primary.dark,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          fontSize: "0.7rem",
                        }}
                      >
                        Candidato
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: designSystem.colors.text.primary,
                          fontWeight: 600,
                          mt: 0.5,
                        }}
                      >
                        {`${currentMerit.user_data_display.user.first_name} ${currentMerit.user_data_display.user.last_name}`}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: designSystem.colors.primary.dark,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          fontSize: "0.7rem",
                        }}
                      >
                        Data de Envio
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: designSystem.colors.text.secondary,
                          fontWeight: 500,
                          mt: 0.5,
                        }}
                      >
                        {new Date(currentMerit.created_at).toLocaleString("pt-BR")}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Navegação */}
                  <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
                    <Button
                      variant="outlined"
                      disabled={currentIndex === 0}
                      onClick={prev}
                      fullWidth
                      sx={{
                        py: 1.5,
                        borderColor: designSystem.colors.primary.main,
                        color: designSystem.colors.primary.main,
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        "&:hover": {
                          borderColor: designSystem.colors.primary.darker,
                          backgroundColor: designSystem.colors.primary.lightest,
                        },
                        "&:disabled": {
                          borderColor: designSystem.colors.border.main,
                          color: designSystem.colors.text.disabled,
                        },
                      }}
                    >
                      ← Anterior
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={currentIndex === count - 1}
                      onClick={next}
                      fullWidth
                      sx={{
                        py: 1.5,
                        borderColor: designSystem.colors.primary.main,
                        color: designSystem.colors.primary.main,
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        "&:hover": {
                          borderColor: designSystem.colors.primary.darker,
                          backgroundColor: designSystem.colors.primary.lightest,
                        },
                        "&:disabled": {
                          borderColor: designSystem.colors.border.main,
                          color: designSystem.colors.text.disabled,
                        },
                      }}
                    >
                      Próximo →
                    </Button>
                  </Box>

                  {/* Ações */}
                  <Box sx={{ mt: "auto" }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled={actionLoading}
                      onClick={approveCurrent}
                      sx={{
                        mb: 1,
                        py: 1.1,
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: designSystem.colors.success.main,
                        borderColor: designSystem.colors.success.main,
                        borderWidth: 1,
                        borderRadius: 1.5,
                        bgcolor: "transparent",
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: "rgba(16, 185, 129, 0.04)",
                          borderColor: designSystem.colors.success.main,
                        },
                        "&:disabled": {
                          color: designSystem.colors.text.disabled,
                          borderColor: designSystem.colors.border.main,
                        },
                      }}
                    >
                      {actionLoading ? <CircularProgress size={18} sx={{ color: designSystem.colors.success.main }} /> : "✓ Aprovar"}
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled={actionLoading}
                      onClick={recuseCurrent}
                      sx={{
                        py: 1.1,
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: designSystem.colors.error.main,
                        borderColor: designSystem.colors.error.main,
                        borderWidth: 1,
                        borderRadius: 1.5,
                        bgcolor: "transparent",
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: "rgba(239, 68, 68, 0.04)",
                          borderColor: designSystem.colors.error.main,
                        },
                        "&:disabled": {
                          color: designSystem.colors.text.disabled,
                          borderColor: designSystem.colors.border.main,
                        },
                      }}
                    >
                      {actionLoading ? <CircularProgress size={18} sx={{ color: designSystem.colors.error.main }} /> : "✕ Reprovar"}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Fade>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AprovacaoMerito;
