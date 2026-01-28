import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  CircularProgress,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Snackbar,
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { APP_ROUTES } from "../../util/constants";
import PageHeader from "../../components/ui/page/PageHeader";
import {
  designSystem,
  paperStyles,
  toolbarStyles,
  iconButtonStyles,
  progressStyles,
  tableHeadStyles,
  tableRowHoverStyles,
  tablePaginationStyles,
  textFieldStyles,
  primaryButtonStyles,
  dialogStyles,
} from "../../styles/designSystem";
import { candidateDocumentsService } from "../../core/http/services/candidateDocumentsService";
import type { CandidateDocument } from "../../core/http/services/candidateDocumentsService";

// Interface para os dados da tela (mapeados da API)
interface CandidateAwaitingCreation {
  id: string;
  userDataId: string;
  studentName: string;
  studentEmail: string;
  personalEmail: string;
  cpf: string;
  phone: string;
  city: string;
  contractSignedDate: string;
  status: "AWAITING_USER_CREATION" | "USER_CREATED";
}

const CriacaoUsuarios: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateAwaitingCreation[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  // Função para mapear dados da API para o formato da tela
  const mapApiDataToCandidate = (doc: CandidateDocument): CandidateAwaitingCreation => ({
    id: doc.id,
    userDataId: doc.user_data_id,
    studentName: doc.student_name || "Nome não informado",
    studentEmail: doc.student_email || "",
    personalEmail: (doc as any).personal_email || doc.student_email || "",
    cpf: (doc as any).cpf || "",
    phone: (doc as any).phone || (doc as any).cellphone || "",
    city: (doc as any).city || "",
    contractSignedDate: doc.created_at
      ? new Date(doc.created_at).toLocaleDateString("pt-BR")
      : "",
    status: (doc as any).user_created ? "USER_CREATED" : "AWAITING_USER_CREATION",
  });

  // Carregar dados da API
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar candidatos com contrato aprovado (aguardando criação de usuário)
      const response = await candidateDocumentsService.list(page + 1, rowsPerPage);

      if (response.status === 200 && response.data) {
        const data = response.data;
        // Filtrar apenas os que têm contrato pendente ou aprovado e ainda não tiveram usuário criado
        const awaitingCreation = (data.data || [])
          .filter((doc: CandidateDocument) =>
            (doc.contract_doc_status === "pending" || doc.contract_doc_status === "approved") &&
            !(doc as any).user_created
          )
          .map(mapApiDataToCandidate);

        setCandidates(awaitingCreation);
        setTotalItems(data.totalItems || awaitingCreation.length);
      } else {
        setSnackbar({
          open: true,
          message: response.message || "Erro ao carregar candidatos",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar candidatos:", error);
      setSnackbar({
        open: true,
        message: "Erro ao conectar com o servidor",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  // Carregar dados ao montar e quando mudar página/tamanho
  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Filtrar candidatos localmente pela busca
  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return candidates;
    const term = searchTerm.toLowerCase();
    return candidates.filter(
      (candidate) =>
        candidate.studentName.toLowerCase().includes(term) ||
        candidate.studentEmail.toLowerCase().includes(term) ||
        candidate.personalEmail.toLowerCase().includes(term) ||
        candidate.cpf.includes(searchTerm) ||
        candidate.userDataId.includes(searchTerm)
    );
  }, [candidates, searchTerm]);

  // Paginação local (já vem paginado da API, mas filtro local pode reduzir)
  const paginatedCandidates = useMemo(() => {
    return filteredCandidates;
  }, [filteredCandidates]);

  // Seleção de candidatos
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedCandidates(paginatedCandidates.map((c) => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const isSelected = (id: string) => selectedCandidates.includes(id);
  const isAllSelected = paginatedCandidates.length > 0 && selectedCandidates.length === paginatedCandidates.length;
  const isIndeterminate = selectedCandidates.length > 0 && selectedCandidates.length < paginatedCandidates.length;

  // Refresh dos dados
  const handleRefresh = () => {
    setSelectedCandidates([]);
    fetchCandidates();
  };

  // Exportar CSV
  const handleExportCSV = () => {
    if (filteredCandidates.length === 0) {
      setSnackbar({
        open: true,
        message: "Nenhum dado para exportar",
        severity: "warning",
      });
      return;
    }

    const headers = [
      "ID",
      "Nome Completo",
      "Email Institucional",
      "Email Pessoal",
      "CPF",
      "Telefone",
      "Cidade",
      "Data Assinatura",
    ];

    const rows = filteredCandidates.map((candidate) => [
      candidate.userDataId,
      candidate.studentName,
      candidate.studentEmail,
      candidate.personalEmail,
      candidate.cpf,
      candidate.phone,
      candidate.city,
      candidate.contractSignedDate,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `alunos_aguardando_criacao_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    setSnackbar({
      open: true,
      message: "Arquivo CSV exportado com sucesso",
      severity: "success",
    });
  };

  // Confirmar criação
  const handleConfirmCreation = () => {
    if (selectedCandidates.length === 0) {
      setSnackbar({
        open: true,
        message: "Selecione pelo menos um aluno",
        severity: "warning",
      });
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleConfirmModalClose = () => {
    setConfirmModalOpen(false);
  };

  const handleConfirmModalConfirm = async () => {
    setConfirmLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Chamar PATCH para cada candidato selecionado
      const updatePromises = selectedCandidates.map(async (id) => {
        try {
          const response = await candidateDocumentsService.update(id, {
            contract_doc_status: "user_created",
          });

          if (response.status === 200 || response.status === 204) {
            successCount++;
            return { success: true, id };
          } else {
            errorCount++;
            console.error(`Erro ao atualizar ${id}:`, response.message);
            return { success: false, id, error: response.message };
          }
        } catch (error) {
          errorCount++;
          console.error(`Erro ao atualizar ${id}:`, error);
          return { success: false, id, error };
        }
      });

      await Promise.all(updatePromises);

      if (successCount > 0 && errorCount === 0) {
        setSnackbar({
          open: true,
          message: `${successCount} usuário(s) confirmado(s) com sucesso. Emails serão enviados para os alunos.`,
          severity: "success",
        });
      } else if (successCount > 0 && errorCount > 0) {
        setSnackbar({
          open: true,
          message: `${successCount} confirmado(s), ${errorCount} com erro. Verifique e tente novamente.`,
          severity: "warning",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Erro ao confirmar criação. Tente novamente.",
          severity: "error",
        });
      }

      setSelectedCandidates([]);
      setConfirmModalOpen(false);

      // Recarregar lista para refletir mudanças
      if (successCount > 0) {
        fetchCandidates();
      }
    } catch (error) {
      console.error("Erro ao confirmar criação:", error);
      setSnackbar({
        open: true,
        message: "Erro ao conectar com o servidor",
        severity: "error",
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const selectedCandidatesData = candidates.filter((c) => selectedCandidates.includes(c.id));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Conteúdo Principal */}
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
          {/* Header da Página */}
          <PageHeader
            title="Criação de Usuários"
            subtitle="Gerencie alunos que assinaram contratos e aguardam criação de usuário no Google"
            description="Esta página lista todos os alunos que assinaram contratos e estão aguardando a criação de usuário no Google Workspace. Você pode exportar um CSV com os dados dos alunos, criar os usuários no Google e depois confirmar a criação selecionando os alunos criados. Ao confirmar, os emails com credenciais serão enviados automaticamente."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Contratos", path: APP_ROUTES.CONTRACTS },
              { label: "Criação de Usuários" },
            ]}
          />

          {/* Tabela de Dados */}
          <Fade in timeout={1000}>
            <Paper {...paperStyles}>
              <Toolbar {...toolbarStyles}>
                <Box display="flex" alignItems="center" sx={{ flex: 1, minWidth: 240, maxWidth: 420 }}>
                  <SearchIcon
                    sx={{
                      mr: 1,
                      color: (theme) =>
                        theme.palette.mode === "dark"
                          ? designSystem.colors.text.disabledDark
                          : designSystem.colors.text.disabled,
                    }}
                  />
                  <TextField
                    placeholder="Pesquisar por nome, email, CPF..."
                    variant="standard"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    {...textFieldStyles}
                  />
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={handleExportCSV}
                    variant="outlined"
                  >
                    Exportar CSV
                  </Button>
                  <IconButton onClick={handleRefresh} {...iconButtonStyles} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
              </Toolbar>

              {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress {...progressStyles} />
                </Box>
              ) : (
                <>
                  {/* Barra de seleção e ação */}
                  {selectedCandidates.length > 0 && (
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? designSystem.colors.background.secondaryDark
                            : designSystem.colors.primary.lightest,
                        borderBottom: (theme) =>
                          `1px solid ${
                            theme.palette.mode === "dark"
                              ? designSystem.colors.border.mainDark
                              : designSystem.colors.border.main
                          }`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          color: (theme) =>
                            theme.palette.mode === "dark"
                              ? designSystem.colors.text.primaryDark
                              : designSystem.colors.text.primary,
                          fontWeight: 500,
                        }}
                      >
                        {selectedCandidates.length}{" "}
                        {selectedCandidates.length === 1 ? "aluno selecionado" : "alunos selecionados"}
                      </Typography>
                      <Button
                        startIcon={<CheckCircleIcon />}
                        onClick={handleConfirmCreation}
                        {...primaryButtonStyles}
                      >
                        Confirmar Criação
                      </Button>
                    </Box>
                  )}

                  <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
                    <Table size="small" sx={{ minWidth: 900 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            {...tableHeadStyles}
                            sx={{ ...tableHeadStyles.sx, width: 50, padding: "8px" }}
                            padding="checkbox"
                          >
                            <Checkbox
                              indeterminate={isIndeterminate}
                              checked={isAllSelected}
                              onChange={handleSelectAll}
                              sx={{
                                color: designSystem.colors.primary.main,
                                "&.Mui-checked": {
                                  color: designSystem.colors.primary.main,
                                },
                                "&.MuiCheckbox-indeterminate": {
                                  color: designSystem.colors.primary.main,
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 100 }}>
                            ID
                          </TableCell>
                          <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 200 }}>
                            Nome do Aluno
                          </TableCell>
                          <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 220 }}>
                            Email Pessoal
                          </TableCell>
                          <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 140 }}>
                            CPF
                          </TableCell>
                          <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 120 }}>
                            Data Assinatura
                          </TableCell>
                          <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 150 }} align="center">
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedCandidates.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                              <Typography
                                sx={{
                                  color: (theme) =>
                                    theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                                  fontSize: "0.95rem",
                                }}
                              >
                                {searchTerm
                                  ? "Nenhum resultado encontrado"
                                  : "Nenhum aluno aguardando criação"}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedCandidates.map((candidate) => {
                            const selected = isSelected(candidate.id);
                            return (
                              <TableRow
                                key={candidate.id}
                                {...tableRowHoverStyles}
                                selected={selected}
                                sx={{
                                  ...tableRowHoverStyles.sx,
                                  ...(selected && {
                                    backgroundColor: (theme) =>
                                      theme.palette.mode === "dark"
                                        ? "rgba(166, 80, 240, 0.25) !important"
                                        : `${designSystem.colors.primary.lighter} !important`,
                                  }),
                                }}
                              >
                                <TableCell padding="checkbox" sx={{ padding: "8px" }}>
                                  <Checkbox
                                    checked={selected}
                                    onChange={() => handleSelectOne(candidate.id)}
                                    sx={{
                                      color: designSystem.colors.primary.main,
                                      "&.Mui-checked": {
                                        color: designSystem.colors.primary.main,
                                      },
                                    }}
                                  />
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: (theme) =>
                                      theme.palette.mode === "dark" ? "#B0B0B0" : "#374151",
                                    fontSize: "0.875rem",
                                    py: 1.5,
                                  }}
                                >
                                  {candidate.userDataId}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: (theme) =>
                                      theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                                    fontWeight: 500,
                                    fontSize: "0.875rem",
                                    py: 1.5,
                                  }}
                                >
                                  {candidate.studentName}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: (theme) =>
                                      theme.palette.mode === "dark" ? "#B0B0B0" : "#374151",
                                    fontSize: "0.875rem",
                                    py: 1.5,
                                    maxWidth: 220,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {candidate.personalEmail}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: (theme) =>
                                      theme.palette.mode === "dark" ? "#B0B0B0" : "#374151",
                                    fontSize: "0.875rem",
                                    py: 1.5,
                                  }}
                                >
                                  {candidate.cpf}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: (theme) =>
                                      theme.palette.mode === "dark" ? "#B0B0B0" : "#374151",
                                    fontSize: "0.875rem",
                                    py: 1.5,
                                  }}
                                >
                                  {candidate.contractSignedDate}
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    py: 1.5,
                                    color: designSystem.colors.warning.main,
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  Aguardando
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                    <TablePagination
                      component="div"
                      count={totalItems}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      labelRowsPerPage="Linhas por página:"
                      labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                      }
                      {...tablePaginationStyles}
                    />
                  </TableContainer>
                </>
              )}
            </Paper>
          </Fade>
        </Box>
      </Box>

      {/* Modal de Confirmação */}
      <Dialog
        open={confirmModalOpen}
        onClose={handleConfirmModalClose}
        maxWidth="sm"
        fullWidth
        {...dialogStyles}
      >
        <DialogTitle
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
            fontWeight: 600,
          }}
        >
          Confirmar Criação de Usuários
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
              mb: 2,
            }}
          >
            Você está prestes a confirmar a criação de{" "}
            <strong>{selectedCandidates.length}</strong>{" "}
            {selectedCandidates.length === 1 ? "usuário" : "usuários"}.
          </Typography>
          <Typography
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
              mb: 3,
            }}
          >
            Isso irá:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <li>
              <Typography
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
                }}
              >
                Atualizar o status dos contratos para "Usuário Criado"
              </Typography>
            </li>
            <li>
              <Typography
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
                }}
              >
                Enviar emails com credenciais de acesso para cada aluno
              </Typography>
            </li>
          </Box>
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? designSystem.colors.background.secondaryDark
                  : designSystem.colors.background.secondary,
              borderRadius: 2,
            }}
          >
            <Typography
              sx={{
                color: (theme) =>
                  theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                fontWeight: 600,
                mb: 1,
                fontSize: "0.875rem",
              }}
            >
              Alunos selecionados:
            </Typography>
            {selectedCandidatesData.map((candidate) => (
              <Typography
                key={candidate.id}
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
                  fontSize: "0.875rem",
                  mb: 0.5,
                }}
              >
                • {candidate.studentName} ({candidate.personalEmail})
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleConfirmModalClose}
            disabled={confirmLoading}
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmModalConfirm}
            disabled={confirmLoading}
            {...primaryButtonStyles}
          >
            {confirmLoading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Confirmar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default CriacaoUsuarios;
