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
  FormControlLabel,
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
import { studentDataService } from "../../core/http/services/studentDataService";

// Interface para os dados da tela (mapeados da API)
type CandidateStatus = "AWAITING_USER_CREATION" | "EMAIL_SENT" | "CONFIRMED";

interface CandidateAwaitingCreation {
  id: string;
  userDataId: string;
  studentName: string;
  studentEmail: string;
  personalEmail: string;
  phone: string;
  city: string;
  contractSignedDate: string;
  status: CandidateStatus;
}

const STATUS_CONFIG: Record<CandidateStatus, { label: string; color: string }> = {
  AWAITING_USER_CREATION: { label: "Aguardando", color: "#F59E0B" },
  EMAIL_SENT: { label: "E-mail enviado", color: "#3B82F6" },
  CONFIRMED: { label: "Confirmado", color: "#10B981" },
};

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
  const [autoDeleteOnError, setAutoDeleteOnError] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  // Função para mapear dados da API para o formato da tela
  const mapApiDataToCandidate = (doc: CandidateDocument): CandidateAwaitingCreation => {
    let status: CandidateStatus = "AWAITING_USER_CREATION";
    if (doc.contract_doc_status === "created") {
      status = "EMAIL_SENT";
    } else if (doc.contract_doc_status === "confirmed") {
      status = "CONFIRMED";
    }

    return {
      id: doc.id,
      userDataId: doc.user_data_id ? String(doc.user_data_id).trim() : "",
      studentName: doc.student_name || "Nome não informado",
      studentEmail: doc.student_email || "",
      personalEmail: (doc as any).personal_email || doc.student_email || "",
      phone: (doc as any).phone || (doc as any).cellphone || "",
      city: (doc as any).city || "",
      contractSignedDate: doc.created_at
        ? new Date(doc.created_at).toLocaleDateString("pt-BR")
        : "",
      status,
    };
  };

  // Carregar dados da API
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar candidatos com contrato aprovado (aguardando criação de usuário)
      const response = await candidateDocumentsService.list(page + 1, rowsPerPage);

      if (response.status === 200 && response.data) {
        const data = response.data;
        // Filtrar candidatos relevantes (aguardando, e-mail enviado, ou confirmado)
        const awaitingCreation = (data.data || [])
          .filter((doc: CandidateDocument) =>
            (doc.contract_doc_status === "pending" ||
              doc.contract_doc_status === "approved" ||
              doc.contract_doc_status === "created" ||
              doc.contract_doc_status === "confirmed") &&
            doc.user_data_id && String(doc.user_data_id).trim() !== ""
          )
          .map(mapApiDataToCandidate)
          .filter((candidate) => candidate.userDataId && candidate.userDataId.trim() !== "");

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
        candidate.userDataId.includes(searchTerm)
    );
  }, [candidates, searchTerm]);

  // Paginação local (já vem paginado da API, mas filtro local pode reduzir)
  const paginatedCandidates = useMemo(() => {
    return filteredCandidates;
  }, [filteredCandidates]);

  // Candidatos selecionáveis (apenas os que estão aguardando)
  const selectableCandidates = useMemo(
    () => paginatedCandidates.filter((c) => c.status === "AWAITING_USER_CREATION"),
    [paginatedCandidates]
  );

  // Seleção de candidatos
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedCandidates(selectableCandidates.map((c) => c.id));
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
  const isAllSelected = selectableCandidates.length > 0 && selectedCandidates.length === selectableCandidates.length;
  const isIndeterminate = selectedCandidates.length > 0 && selectedCandidates.length < selectableCandidates.length;

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
      "Telefone",
      "Cidade",
      "Data Assinatura",
    ];

    const rows = filteredCandidates.map((candidate) => [
      candidate.userDataId,
      candidate.studentName,
      candidate.studentEmail,
      candidate.personalEmail,
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
    setAutoDeleteOnError(false);
  };

  const handleConfirmModalConfirm = async () => {
    setConfirmLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Chamar PATCH para cada candidato selecionado
      const updatePromises = selectedCandidates.map(async (id) => {
        // Encontrar o candidato para obter o userDataId (fora do try para acessar no catch)
        const candidate = candidates.find((c) => c.id === id);
        try {
          if (!candidate) {
            errorCount++;
            console.error(`Candidato não encontrado: ${id}`);
            return { success: false, id, error: "Candidato não encontrado" };
          }

          // Validar userDataId
          if (!candidate.userDataId || candidate.userDataId.trim() === "") {
            errorCount++;
            console.error(`userDataId inválido para candidato ${id}:`, candidate.userDataId);
            return { success: false, id, error: "user_data_id inválido" };
          }

          // Garantir que userDataId seja uma string válida
          const userDataId = String(candidate.userDataId).trim();
          if (!/^\d+$/.test(userDataId)) {
            errorCount++;
            console.error(`userDataId não é um número válido para candidato ${id}:`, candidate.userDataId);
            return { success: false, id, error: "user_data_id deve ser um número válido" };
          }

          const response = await candidateDocumentsService.update(userDataId, {
            contract_doc_status: "approved",
          });

          if (response.status === 200 || response.status === 204) {
            successCount++;
            return { success: true, id };
          } else {
            errorCount++;
            const errorMessage = response.message || "Erro desconhecido";
            
            // Tratar erro específico de tenant city/domain
            // Obs: no schema atual existe apenas "domain" em tenant_city (não existe "tag")
            if (
              errorMessage.toLowerCase().includes("tenant city") ||
              errorMessage.toLowerCase().includes("tenant_city") ||
              errorMessage.toLowerCase().includes("domain") ||
              errorMessage.toLowerCase().includes("domínio")
            ) {
              console.error(`Erro de tenant city ao atualizar ${userDataId}:`, errorMessage);
              return { 
                success: false, 
                id, 
                error: "Tenant city não encontrada ou sem domínio configurado. Verifique o domínio da tenant city e tente novamente."
              };
            }
            
            // Tratar erro de student_data já existente
            if (
              errorMessage.toLowerCase().includes("dados do estudante já existem") ||
              errorMessage.toLowerCase().includes("student data") ||
              errorMessage.toLowerCase().includes("user_data_id") ||
              errorMessage.toLowerCase().includes("violação de constraint única") ||
              response.status === 409
            ) {
              console.error(`Erro: Dados do estudante já existem para ${candidate.studentName}:`, errorMessage);
              return { 
                success: false, 
                id, 
                candidate,
                error: "Dados do estudante já existem no sistema",
                errorType: "STUDENT_DATA_EXISTS"
              };
            }
            
            console.error(`Erro ao atualizar ${userDataId}:`, errorMessage);
            return { success: false, id, candidate, error: errorMessage };
          }
        } catch (error: any) {
          errorCount++;
          const errorMessage = error?.message || error?.response?.data?.message || String(error);

          // Tratar erro específico de tenant city/domain
          if (
            errorMessage.toLowerCase().includes("tenant city") ||
            errorMessage.toLowerCase().includes("tenant_city") ||
            errorMessage.toLowerCase().includes("domain") ||
            errorMessage.toLowerCase().includes("domínio")
          ) {
            console.error(`Erro de tenant city ao atualizar ${id}:`, errorMessage);
            return {
              success: false,
              id,
              candidate,
              error: "Tenant city não encontrada ou sem domínio configurado. Verifique o domínio da tenant city e tente novamente."
            };
          }

          // Tratar erro de student_data já existente
          if (
            errorMessage.toLowerCase().includes("dados do estudante já existem") ||
            errorMessage.toLowerCase().includes("student data") ||
            errorMessage.toLowerCase().includes("user_data_id") ||
            errorMessage.toLowerCase().includes("violação de constraint única") ||
            error?.response?.status === 409 ||
            (error?.response?.data?.statusCode === 409 && errorMessage.toLowerCase().includes("constraint"))
          ) {
            console.error(`Erro: Dados do estudante já existem para ${candidate?.studentName}:`, errorMessage);
            return {
              success: false,
              id,
              candidate,
              error: "Dados do estudante já existem no sistema",
              errorType: "STUDENT_DATA_EXISTS"
            };
          }

          console.error(`Erro ao atualizar ${id}:`, error);
          return { success: false, id, candidate, error: errorMessage };
        }
      });

      const results = await Promise.all(updatePromises);

      // Coletar erros específicos para mensagens mais detalhadas
      const tenantCityErrors = results.filter(
        (result) =>
          result &&
          !result.success &&
          result.error &&
          (result.error.toLowerCase().includes("tenant city") ||
            result.error.toLowerCase().includes("tenant_city") ||
            result.error.toLowerCase().includes("domain") ||
            result.error.toLowerCase().includes("domínio"))
      );

      // Coletar erros de student_data já existente
      const studentDataExistsErrors = results.filter(
        (result) =>
          result &&
          !result.success &&
          (result.errorType === "STUDENT_DATA_EXISTS" ||
            (result.error && result.error.toLowerCase().includes("dados do estudante já existem")))
      );

      // Se houver erros de student_data e autoDeleteOnError estiver ativado, tentar apagar e recriar
      if (studentDataExistsErrors.length > 0 && autoDeleteOnError) {
        console.log("Auto-delete ativado para os seguintes usuários:", studentDataExistsErrors.map(r => r.candidate?.studentName));
        
        // Tentar apagar os student_data duplicados e recriar
        const deletePromises = studentDataExistsErrors.map(async (errorResult) => {
          if (!errorResult.candidate?.userDataId) return { success: false, candidate: errorResult.candidate, originalError: errorResult };
          
          try {
            // Apagar student_data existente
            const deleteResponse = await studentDataService.deleteByUserDataId(errorResult.candidate.userDataId);

            if (deleteResponse.status !== 200 && deleteResponse.status !== 204) {
              console.error(`Erro ao apagar student data para ${errorResult.candidate.studentName}:`, deleteResponse.message);
              return { success: false, candidate: errorResult.candidate, error: deleteResponse.message || "Erro ao apagar dados do estudante", originalError: errorResult };
            }

            console.log(`Student data apagado para ${errorResult.candidate.studentName}`);

            // Tentar novamente criar o usuário
            const retryResponse = await candidateDocumentsService.update(errorResult.candidate.userDataId, {
              contract_doc_status: "created",
            });

            if (retryResponse.status === 200 || retryResponse.status === 204) {
              return { success: true, candidate: errorResult.candidate, originalError: errorResult };
            } else {
              return { success: false, candidate: errorResult.candidate, error: retryResponse.message || "Erro ao recriar", originalError: errorResult };
            }
          } catch (deleteError: any) {
            console.error(`Erro ao apagar/recriar para ${errorResult.candidate.studentName}:`, deleteError);
            return { success: false, candidate: errorResult.candidate, error: deleteError?.message || "Erro ao apagar/recriar", originalError: errorResult };
          }
        });
        
        const retryResults = await Promise.all(deletePromises);
        
        // Atualizar contadores baseado nos resultados do retry
        const retrySuccessCount = retryResults.filter(r => r.success).length;
        const retryErrorCount = retryResults.filter(r => !r.success).length;
        
        // Atualizar contadores globais
        successCount += retrySuccessCount;
        errorCount = errorCount - retrySuccessCount + retryErrorCount;
        
        // Remover os erros que foram resolvidos com sucesso e atualizar os que falharam
        const remainingErrors: typeof studentDataExistsErrors = [];
        retryResults.forEach((retryResult, index) => {
          if (!retryResult.success) {
            // Atualizar o resultado original com o novo erro
            const originalIndex = results.findIndex(r => r.id === retryResult.originalError.id);
            if (originalIndex >= 0) {
              results[originalIndex] = {
                ...retryResult.originalError,
                error: retryResult.error || retryResult.originalError.error,
              };
            }
            remainingErrors.push(retryResult.originalError);
          } else {
            // Remover o erro da lista de resultados
            const originalIndex = results.findIndex(r => r.id === retryResult.originalError.id);
            if (originalIndex >= 0) {
              results[originalIndex] = { ...retryResult.originalError, success: true };
            }
          }
        });
        
        // Atualizar a lista de erros de student_data
        studentDataExistsErrors.splice(0, studentDataExistsErrors.length, ...remainingErrors);
      }

      if (successCount > 0 && errorCount === 0) {
        setSnackbar({
          open: true,
          message: `${successCount} usuário(s) confirmado(s) com sucesso. Emails serão enviados para os alunos.`,
          severity: "success",
        });
      } else if (successCount > 0 && errorCount > 0) {
        let errorMessage = `${successCount} confirmado(s), ${errorCount} com erro.`;
        
        if (studentDataExistsErrors.length > 0) {
          const studentNames = studentDataExistsErrors
            .map(r => r.candidate?.studentName || "Nome não disponível")
            .join(", ");
          errorMessage += `\n\nUsuários com dados já existentes: ${studentNames}`;
        }
        
        if (tenantCityErrors.length > 0) {
          errorMessage += "\nAlguns erros podem estar relacionados à configuração do tenant city (tag/domain).";
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "warning",
        });
      } else {
        let errorMessage = "Erro ao confirmar criação.";
        
        if (studentDataExistsErrors.length > 0) {
          const studentNames = studentDataExistsErrors
            .map(r => r.candidate?.studentName || "Nome não disponível")
            .join(", ");
          errorMessage = `Dados do estudante já existem no sistema para os seguintes usuários:\n${studentNames}`;
          
          if (studentDataExistsErrors.length === selectedCandidates.length) {
            errorMessage += "\n\nTodos os usuários selecionados já possuem dados cadastrados.";
          }
        } else if (tenantCityErrors.length > 0) {
          errorMessage =
            "Erro: Tenant city não encontrada ou sem domínio configurado. Verifique o domínio da tenant city antes de tentar novamente.";
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      }

      // Atualizar status local dos candidatos confirmados com sucesso
      const successIds = results
        .filter((r) => r.success)
        .map((r) => r.id);

      if (successIds.length > 0) {
        setCandidates((prev) =>
          prev.map((c) =>
            successIds.includes(c.id) ? { ...c, status: "EMAIL_SENT" as CandidateStatus } : c
          )
        );
      }

      setSelectedCandidates([]);
      setConfirmModalOpen(false);
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
                    placeholder="Pesquisar por nome, email, ID..."
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
                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
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
                                    disabled={candidate.status !== "AWAITING_USER_CREATION"}
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
                                  {candidate.contractSignedDate}
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    py: 1.5,
                                    color: STATUS_CONFIG[candidate.status].color,
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {STATUS_CONFIG[candidate.status].label}
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
          <Box sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={autoDeleteOnError}
                  onChange={(e) => setAutoDeleteOnError(e.target.checked)}
                  sx={{
                    color: designSystem.colors.primary.main,
                    "&.Mui-checked": {
                      color: designSystem.colors.primary.main,
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
                    fontSize: "0.875rem",
                  }}
                >
                  Apagar e recriar automaticamente se dados do estudante já existirem
                </Typography>
              }
            />
            <Typography
              sx={{
                color: (theme) =>
                  theme.palette.mode === "dark" ? "#9CA3AF" : "#6B7280",
                fontSize: "0.75rem",
                mt: 0.5,
                ml: 4.5,
              }}
            >
              Se marcado, os dados duplicados serão apagados automaticamente antes de criar o usuário
            </Typography>
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
        autoHideDuration={snackbar.severity === "error" ? 8000 : 4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ 
            width: "100%",
            whiteSpace: "pre-line",
            maxWidth: "600px",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CriacaoUsuarios;
