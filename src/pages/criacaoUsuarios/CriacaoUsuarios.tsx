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
  Tabs,
  Tab,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  HowToReg as EnrollIcon,
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
import {
  studentDataService,
  type StudentReadyToEnrolledCsvDto,
  type PaginatedResponse,
} from "../../core/http/services/studentDataService";

// ==================== Tab 0: Criação de Usuários ====================

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
  const [activeTab, setActiveTab] = useState(0);

  // ==================== Tab 0 State ====================
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

  // ==================== Tab 1 State (Matrícula CSV) ====================
  const [enrollStudents, setEnrollStudents] = useState<StudentReadyToEnrolledCsvDto[]>([]);
  const [enrollLoading, setEnrollLoading] = useState(true);
  const [enrollConfirmLoading, setEnrollConfirmLoading] = useState(false);
  const [enrollSearchTerm, setEnrollSearchTerm] = useState("");
  const [enrollPage, setEnrollPage] = useState(0);
  const [enrollRowsPerPage, setEnrollRowsPerPage] = useState(10);
  const [enrollTotalItems, setEnrollTotalItems] = useState(0);
  const [enrollSelectedStudents, setEnrollSelectedStudents] = useState<string[]>([]);
  const [enrollConfirmModalOpen, setEnrollConfirmModalOpen] = useState(false);
  const [enrollRefreshKey, setEnrollRefreshKey] = useState(0);

  // ==================== Tab 0: Criação de Usuários Logic ====================

  // Função auxiliar para buscar student_data_id a partir de user_data_id
  const findStudentDataIdByUserDataId = async (userDataId: string | number): Promise<string | null> => {
    try {
      let currentPage = 1;
      const pageSize = 100;
      let totalSearched = 0;

      console.log(`[findStudentDataIdByUserDataId] Buscando student_data para user_data_id=${userDataId}`);

      while (true) {
        const listResponse = await studentDataService.list(currentPage, pageSize);

        if (listResponse.status !== 200 || !listResponse.data) {
          console.log(`[findStudentDataIdByUserDataId] Resposta inválida: status=${listResponse.status}`);
          break;
        }

        const responseData = listResponse.data;
        const items: any[] = Array.isArray(responseData?.data) ? responseData.data : [];
        const totalPages = responseData?.totalPages || 1;
        totalSearched += items.length;

        console.log(`[findStudentDataIdByUserDataId] Página ${currentPage}/${totalPages}, ${items.length} itens, total pesquisado: ${totalSearched}`);

        // Tentar encontrar por user_data_id (pode ter diferentes nomes de campo)
        // Nota: O campo pode ser user_data_id, userDataId, ou user_id dependendo da estrutura da API
        const match = items.find((item: any) => {
          const itemUserDataId = item.user_data_id || item.userDataId || item.user_id;
          const match = String(itemUserDataId) === String(userDataId);
          if (match) {
            console.log(`[findStudentDataIdByUserDataId] Match encontrado! Campo usado: ${item.user_data_id ? 'user_data_id' : item.userDataId ? 'userDataId' : 'user_id'}, valor: ${itemUserDataId}`);
          }
          return match;
        });

        if (match) {
          console.log(`[findStudentDataIdByUserDataId] Encontrado: student_data id=${match.id} para user_data_id=${userDataId}`);
          return String(match.id);
        }

        if (currentPage >= totalPages || items.length === 0) {
          console.log(`[findStudentDataIdByUserDataId] Fim da busca. Total de páginas: ${totalPages}, última página tinha ${items.length} itens`);
          break;
        }
        currentPage++;
      }

      console.log(`[findStudentDataIdByUserDataId] student_data não encontrado para user_data_id=${userDataId} após pesquisar ${totalSearched} registros`);
      return null;
    } catch (error) {
      console.error(`[findStudentDataIdByUserDataId] Erro ao buscar student_data_id para user_data_id ${userDataId}:`, error);
      return null;
    }
  };

  const mapApiDataToCandidate = (doc: CandidateDocument): CandidateAwaitingCreation => {
    let status: CandidateStatus = "AWAITING_USER_CREATION";
    // pending e approved → AWAITING_USER_CREATION (contrato aprovado, aguardando criação do usuário no Google)
    if (doc.contract_doc_status === "created") {
      status = "EMAIL_SENT"; // usuário criado no Google, email enviado
    } else if (doc.contract_doc_status === "confirmed") {
      status = "CONFIRMED"; // usuário confirmou
    }
    // Se for pending ou approved, mantém AWAITING_USER_CREATION (padrão)

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

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await candidateDocumentsService.list(page + 1, rowsPerPage);

      if (response.status === 200 && response.data) {
        const data = response.data;
        // Filtrar apenas contratos com status "approved" (já aprovados na página de aprovação)
        const awaitingCreation = (data.data || [])
          .filter((doc: CandidateDocument) =>
            doc.contract_doc_status === "approved" &&
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

  useEffect(() => {
    if (activeTab === 0) {
      fetchCandidates();
    }
  }, [activeTab, fetchCandidates]);

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

  const paginatedCandidates = filteredCandidates;

  const selectableCandidates = useMemo(
    () => paginatedCandidates.filter((c) => c.status === "AWAITING_USER_CREATION"),
    [paginatedCandidates]
  );

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

  const handleRefresh = () => {
    setSelectedCandidates([]);
    fetchCandidates();
  };

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
      const updatePromises = selectedCandidates.map(async (id) => {
        const candidate = candidates.find((c) => c.id === id);
        try {
          if (!candidate) {
            errorCount++;
            console.error(`Candidato não encontrado: ${id}`);
            return { success: false, id, error: "Candidato não encontrado" };
          }

          if (!candidate.userDataId || candidate.userDataId.trim() === "") {
            errorCount++;
            console.error(`userDataId inválido para candidato ${id}:`, candidate.userDataId);
            return { success: false, id, error: "user_data_id inválido" };
          }

          const userDataId = String(candidate.userDataId).trim();
          if (!/^\d+$/.test(userDataId)) {
            errorCount++;
            console.error(`userDataId não é um número válido para candidato ${id}:`, candidate.userDataId);
            return { success: false, id, error: "user_data_id deve ser um número válido" };
          }

          // 1. Buscar student_data_id a partir de user_data_id
          let studentDataId = await findStudentDataIdByUserDataId(userDataId);

          // 2. Se não encontrou, criar o student_data
          // O student_data deveria ser criado automaticamente quando o contrato é aprovado,
          // mas se não foi, criamos manualmente aqui
          if (!studentDataId) {
            console.log(`[handleConfirmModalConfirm] student_data não encontrado para user_data_id ${userDataId}, criando...`);
            
            try {
              const createResponse = await studentDataService.create({
                user_data_id: Number(userDataId),
                monitor: 'S/N',
                status: 'active',
              });

              if (createResponse.status >= 200 && createResponse.status < 300 && createResponse.data) {
                // Se a resposta retornar o ID diretamente
                if (createResponse.data.id) {
                  studentDataId = String(createResponse.data.id);
                  console.log(`[handleConfirmModalConfirm] student_data criado com sucesso, id=${studentDataId}`);
                } else {
                  // Se não retornar o ID, buscar novamente
                  studentDataId = await findStudentDataIdByUserDataId(userDataId);
                  if (!studentDataId) {
                    errorCount++;
                    return { 
                      success: false, 
                      id, 
                      candidate,
                      error: "Erro ao criar student_data: criado mas não foi possível obter o ID." 
                    };
                  }
                }
              } else {
                errorCount++;
                const errorMessage = createResponse.message || "Erro ao criar student_data";
                console.error(`[handleConfirmModalConfirm] Erro ao criar student_data:`, errorMessage);
                return { 
                  success: false, 
                  id, 
                  candidate,
                  error: `Erro ao criar dados do estudante: ${errorMessage}` 
                };
              }
            } catch (createError: any) {
              errorCount++;
              const errorMessage = createError?.message || createError?.response?.data?.message || "Erro desconhecido ao criar student_data";
              console.error(`[handleConfirmModalConfirm] Erro ao criar student_data:`, createError);
              return { 
                success: false, 
                id, 
                candidate,
                error: `Erro ao criar dados do estudante: ${errorMessage}` 
              };
            }
          }

          // 3. Atualizar student_data.status para "enrolled" (matriculado)
          // Isso também dispara o envio de email com credenciais
          const studentResponse = await studentDataService.update(studentDataId, {
            status: "enrolled",
          });

          if (studentResponse.status === 200 || studentResponse.status === 204) {
            successCount++;
            return { success: true, id };
          } else {
            errorCount++;
            const errorMessage = studentResponse.message || "Erro ao atualizar status do estudante";

            if (
              errorMessage.toLowerCase().includes("cidade sede") ||
              errorMessage.toLowerCase().includes("tenant_city") ||
              errorMessage.toLowerCase().includes("domain") ||
              errorMessage.toLowerCase().includes("domínio")
            ) {
              console.error(`Erro de cidade sede ao atualizar ${userDataId}:`, errorMessage);
              return {
                success: false,
                id,
                error: "Cidade sede não encontrada ou sem domínio configurado. Verifique o domínio da cidade sede e tente novamente."
              };
            }

            if (
              errorMessage.toLowerCase().includes("dados do estudante já existem") ||
              errorMessage.toLowerCase().includes("student data") ||
              errorMessage.toLowerCase().includes("user_data_id") ||
              errorMessage.toLowerCase().includes("violação de constraint única") ||
              studentResponse.status === 409
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

          if (
            errorMessage.toLowerCase().includes("cidade sede") ||
            errorMessage.toLowerCase().includes("tenant_city") ||
            errorMessage.toLowerCase().includes("domain") ||
            errorMessage.toLowerCase().includes("domínio")
          ) {
            console.error(`Erro de cidade sede ao atualizar ${id}:`, errorMessage);
            return {
              success: false,
              id,
              candidate,
              error: "Cidade sede não encontrada ou sem domínio configurado. Verifique o domínio da cidade sede e tente novamente."
            };
          }

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

      const tenantCityErrors = results.filter(
        (result) =>
          result &&
          !result.success &&
          result.error &&
          (result.error.toLowerCase().includes("cidade sede") ||
            result.error.toLowerCase().includes("tenant_city") ||
            result.error.toLowerCase().includes("domain") ||
            result.error.toLowerCase().includes("domínio"))
      );

      const studentDataExistsErrors = results.filter(
        (result) =>
          result &&
          !result.success &&
          (result.errorType === "STUDENT_DATA_EXISTS" ||
            (result.error && result.error.toLowerCase().includes("dados do estudante já existem")))
      );

      if (studentDataExistsErrors.length > 0 && autoDeleteOnError) {
        console.log("Auto-delete ativado para os seguintes usuários:", studentDataExistsErrors.map(r => r.candidate?.studentName));

        const deletePromises = studentDataExistsErrors.map(async (errorResult) => {
          if (!errorResult.candidate?.userDataId) return { success: false, candidate: errorResult.candidate, originalError: errorResult };

          try {
            const deleteResponse = await studentDataService.deleteByUserDataId(errorResult.candidate.userDataId);

            if (deleteResponse.status !== 200 && deleteResponse.status !== 204) {
              console.error(`Erro ao apagar student data para ${errorResult.candidate.studentName}:`, deleteResponse.message);
              return { success: false, candidate: errorResult.candidate, error: deleteResponse.message || "Erro ao apagar dados do estudante", originalError: errorResult };
            }

            console.log(`Student data apagado para ${errorResult.candidate.studentName}`);

            // Após apagar o student_data duplicado, retornar sucesso
            // O student_data será recriado automaticamente pelo backend quando necessário
            // Nota: O admin precisará tentar confirmar a criação novamente após o student_data ser recriado
            return { success: true, candidate: errorResult.candidate, originalError: errorResult };
          } catch (deleteError: any) {
            console.error(`Erro ao apagar/recriar para ${errorResult.candidate.studentName}:`, deleteError);
            return { success: false, candidate: errorResult.candidate, error: deleteError?.message || "Erro ao apagar/recriar", originalError: errorResult };
          }
        });

        const retryResults = await Promise.all(deletePromises);

        const retrySuccessCount = retryResults.filter(r => r.success).length;
        const retryErrorCount = retryResults.filter(r => !r.success).length;

        successCount += retrySuccessCount;
        errorCount = errorCount - retrySuccessCount + retryErrorCount;

        const remainingErrors: typeof studentDataExistsErrors = [];
        retryResults.forEach((retryResult) => {
          if (!retryResult.success) {
            const originalIndex = results.findIndex(r => r.id === retryResult.originalError.id);
            if (originalIndex >= 0) {
              results[originalIndex] = {
                ...retryResult.originalError,
                error: retryResult.error || retryResult.originalError.error,
              };
            }
            remainingErrors.push(retryResult.originalError);
          } else {
            const originalIndex = results.findIndex(r => r.id === retryResult.originalError.id);
            if (originalIndex >= 0) {
              results[originalIndex] = { ...retryResult.originalError, success: true };
            }
          }
        });

        studentDataExistsErrors.splice(0, studentDataExistsErrors.length, ...remainingErrors);
      }

      if (successCount > 0 && errorCount === 0) {
        setSnackbar({
          open: true,
          message: `${successCount} usuário(s) confirmado(s) com sucesso. Status atualizado para "Enrolled" e emails com credenciais serão enviados para os alunos.`,
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
          errorMessage += "\nAlguns erros podem estar relacionados à configuração do cidade sede (tag/domain).";
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
            "Erro: Cidade sede não encontrada ou sem domínio configurado. Verifique o domínio da cidade sede antes de tentar novamente.";
        }

        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      }

      const successIds = results
        .filter((r) => r.success)
        .map((r) => r.id);

      if (successIds.length > 0) {
        // Re-fetch para obter dados atualizados da API
        await fetchCandidates();
        setSelectedCandidates([]);
      } else {
        setSelectedCandidates([]);
      }

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

  // ==================== Tab 1: Matrícula CSV Logic ====================

  const fetchEnrollStudents = useCallback(async () => {
    setEnrollLoading(true);
    try {
      const response = await studentDataService.listReadyToEnrolledCsv(enrollPage + 1, enrollRowsPerPage);

      if (response.status >= 200 && response.status < 300 && response.data) {
        const responseData = response.data as PaginatedResponse<StudentReadyToEnrolledCsvDto>;
        setEnrollStudents(responseData.data || []);
        setEnrollTotalItems(responseData.totalItems ?? (responseData.data || []).length);
      } else {
        setSnackbar({
          open: true,
          message: "Falha ao carregar estudantes para matrícula",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Erro ao buscar estudantes para matrícula:", err);
      setSnackbar({
        open: true,
        message: "Erro ao conectar com o servidor",
        severity: "error",
      });
    } finally {
      setEnrollLoading(false);
    }
  }, [enrollPage, enrollRowsPerPage, enrollRefreshKey]);

  useEffect(() => {
    if (activeTab === 1) {
      fetchEnrollStudents();
    }
  }, [activeTab, fetchEnrollStudents]);

  const filteredEnrollStudents = useMemo(() => {
    if (!enrollSearchTerm.trim()) return enrollStudents;
    const term = enrollSearchTerm.toLowerCase();
    return enrollStudents.filter(
      (s) =>
        s.full_name.toLowerCase().includes(term) ||
        s.registration.toLowerCase().includes(term) ||
        s.cpf.includes(enrollSearchTerm) ||
        s.corp_email.toLowerCase().includes(term) ||
        s.personal_email.toLowerCase().includes(term)
    );
  }, [enrollStudents, enrollSearchTerm]);

  const enrollSelectableStudents = filteredEnrollStudents;

  const handleEnrollSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setEnrollSelectedStudents(enrollSelectableStudents.map((s) => s.student_data_id));
    } else {
      setEnrollSelectedStudents([]);
    }
  };

  const handleEnrollSelectOne = (studentDataId: string) => {
    setEnrollSelectedStudents((prev) =>
      prev.includes(studentDataId)
        ? prev.filter((id) => id !== studentDataId)
        : [...prev, studentDataId]
    );
  };

  const isEnrollSelected = (studentDataId: string) => enrollSelectedStudents.includes(studentDataId);
  const isEnrollAllSelected = enrollSelectableStudents.length > 0 && enrollSelectedStudents.length === enrollSelectableStudents.length;
  const isEnrollIndeterminate = enrollSelectedStudents.length > 0 && enrollSelectedStudents.length < enrollSelectableStudents.length;

  const handleEnrollRefresh = () => {
    setEnrollSearchTerm("");
    setEnrollSelectedStudents([]);
    setEnrollPage(0);
    setEnrollRefreshKey((prev) => prev + 1);
  };

  const handleEnrollExportCSV = () => {
    if (filteredEnrollStudents.length === 0) {
      setSnackbar({
        open: true,
        message: "Nenhum dado para exportar",
        severity: "warning",
      });
      return;
    }

    const headers = [
      "ID Student Data",
      "Nome Completo",
      "Matrícula",
      "E-mail Corporativo",
      "E-mail Pessoal",
      "CPF",
      "Cidade",
    ];

    const rows = filteredEnrollStudents.map((s) => [
      s.student_data_id,
      s.full_name,
      s.registration,
      s.corp_email,
      s.personal_email,
      s.cpf,
      s.city,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `estudantes_para_matricula_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    setSnackbar({
      open: true,
      message: "Arquivo CSV exportado com sucesso",
      severity: "success",
    });
  };

  const handleEnrollConfirm = () => {
    if (enrollSelectedStudents.length === 0) {
      setSnackbar({
        open: true,
        message: "Selecione pelo menos um estudante",
        severity: "warning",
      });
      return;
    }
    setEnrollConfirmModalOpen(true);
  };

  const handleEnrollConfirmModalClose = () => {
    setEnrollConfirmModalOpen(false);
  };

  const handleEnrollConfirmModalConfirm = async () => {
    setEnrollConfirmLoading(true);
    try {
      const response = await studentDataService.enrollMultipleStudents(enrollSelectedStudents);

      if (response.status >= 200 && response.status < 300) {
        const count = enrollSelectedStudents.length;
        setEnrollSelectedStudents([]);
        setEnrollRefreshKey((prev) => prev + 1);
        setSnackbar({
          open: true,
          message: `${count} estudante(s) matriculado(s) com sucesso! Emails com credenciais serão enviados.`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || "Falha ao matricular estudantes",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Erro ao matricular estudantes:", err);
      setSnackbar({
        open: true,
        message: "Erro ao conectar com o servidor",
        severity: "error",
      });
    } finally {
      setEnrollConfirmLoading(false);
      setEnrollConfirmModalOpen(false);
    }
  };

  const handleEnrollChangePage = (_event: unknown, newPage: number) => {
    setEnrollPage(newPage);
  };

  const handleEnrollChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnrollRowsPerPage(parseInt(event.target.value, 10));
    setEnrollPage(0);
  };

  const selectedEnrollStudentsData = enrollStudents.filter((s) =>
    enrollSelectedStudents.includes(s.student_data_id)
  );

  // ==================== Render ====================

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
            title="Criação de Usuários e Matrícula"
            subtitle="Gerencie a criação de usuários no Google e a matrícula dos estudantes"
            description="Etapa 1: Exporte o CSV dos alunos com contrato assinado, crie os usuários no Google e confirme a criação. Etapa 2: Exporte o CSV dos alunos prontos para matrícula, cadastre externamente e confirme a matrícula."
            breadcrumbs={[
              { label: "Dashboard", path: APP_ROUTES.DASHBOARD },
              { label: "Contratos", path: APP_ROUTES.CONTRACTS },
              { label: "Criação de Usuários e Matrícula" },
            ]}
          />

          {/* Tabs */}
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_e, newValue) => setActiveTab(newValue)}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                  "&.Mui-selected": {
                    color: designSystem.colors.primary.main,
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: designSystem.colors.primary.main,
                },
              }}
            >
              <Tab label="Etapa 1 - Criação de Usuários" />
              <Tab label="Etapa 2 - Matrícula CSV" />
            </Tabs>
          </Box>

          {/* ==================== Tab 0: Criação de Usuários ==================== */}
          {activeTab === 0 && (
            <Fade in timeout={500}>
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
          )}

          {/* ==================== Tab 1: Matrícula CSV ==================== */}
          {activeTab === 1 && (
            <Fade in timeout={500}>
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
                      placeholder="Pesquisar por nome, matrícula, e-mail ou CPF..."
                      variant="standard"
                      fullWidth
                      value={enrollSearchTerm}
                      onChange={(e) => setEnrollSearchTerm(e.target.value)}
                      {...textFieldStyles}
                    />
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Button
                      startIcon={<DownloadIcon />}
                      onClick={handleEnrollExportCSV}
                      variant="outlined"
                    >
                      Exportar CSV
                    </Button>
                    <IconButton onClick={handleEnrollRefresh} {...iconButtonStyles} disabled={enrollLoading}>
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                </Toolbar>

                {enrollLoading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress {...progressStyles} />
                  </Box>
                ) : (
                  <>
                    {enrollSelectedStudents.length > 0 && (
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
                          {enrollSelectedStudents.length}{" "}
                          {enrollSelectedStudents.length === 1 ? "estudante selecionado" : "estudantes selecionados"}
                        </Typography>
                        <Button
                          startIcon={<EnrollIcon />}
                          onClick={handleEnrollConfirm}
                          {...primaryButtonStyles}
                        >
                          Confirmar Matrícula
                        </Button>
                      </Box>
                    )}

                    <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
                      <Table size="small" sx={{ minWidth: 1100 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              {...tableHeadStyles}
                              sx={{ ...tableHeadStyles.sx, width: 50, padding: "8px" }}
                              padding="checkbox"
                            >
                              <Checkbox
                                indeterminate={isEnrollIndeterminate}
                                checked={isEnrollAllSelected}
                                onChange={handleEnrollSelectAll}
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
                            <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 180 }}>
                              Nome Completo
                            </TableCell>
                            <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 120 }}>
                              Matrícula
                            </TableCell>
                            <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 200 }}>
                              E-mail Corporativo
                            </TableCell>
                            <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 200 }}>
                              E-mail Pessoal
                            </TableCell>
                            <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 130 }}>
                              CPF
                            </TableCell>
                            <TableCell {...tableHeadStyles} sx={{ ...tableHeadStyles.sx, width: 130 }}>
                              Cidade
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredEnrollStudents.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                <Typography
                                  sx={{
                                    color: (theme) =>
                                      theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  {enrollSearchTerm
                                    ? "Nenhum resultado encontrado"
                                    : "Nenhum estudante disponível para matrícula"}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredEnrollStudents.map((student) => {
                              const selected = isEnrollSelected(student.student_data_id);
                              return (
                                <TableRow
                                  key={student.student_data_id}
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
                                      onChange={() => handleEnrollSelectOne(student.student_data_id)}
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
                                    {student.student_data_id}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color: (theme) =>
                                        theme.palette.mode === "dark" ? "#FFFFFF" : "#1F2937",
                                      fontWeight: 500,
                                      fontSize: "0.875rem",
                                      py: 1.5,
                                      maxWidth: 180,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {student.full_name}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color: (theme) =>
                                        theme.palette.mode === "dark" ? "#B0B0B0" : "#374151",
                                      fontSize: "0.875rem",
                                      py: 1.5,
                                    }}
                                  >
                                    {student.registration}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color: (theme) =>
                                        theme.palette.mode === "dark" ? "#B0B0B0" : "#374151",
                                      fontSize: "0.875rem",
                                      py: 1.5,
                                      maxWidth: 200,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {student.corp_email}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color: (theme) =>
                                        theme.palette.mode === "dark" ? "#B0B0B0" : "#374151",
                                      fontSize: "0.875rem",
                                      py: 1.5,
                                      maxWidth: 200,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {student.personal_email}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color: (theme) =>
                                        theme.palette.mode === "dark" ? "#B0B0B0" : "#374151",
                                      fontSize: "0.875rem",
                                      py: 1.5,
                                    }}
                                  >
                                    {student.cpf}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color: (theme) =>
                                        theme.palette.mode === "dark" ? "#B0B0B0" : "#374151",
                                      fontSize: "0.875rem",
                                      py: 1.5,
                                    }}
                                  >
                                    {student.city}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                      <TablePagination
                        component="div"
                        count={enrollSearchTerm.trim() ? filteredEnrollStudents.length : enrollTotalItems}
                        page={enrollPage}
                        onPageChange={handleEnrollChangePage}
                        rowsPerPage={enrollRowsPerPage}
                        onRowsPerPageChange={handleEnrollChangeRowsPerPage}
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
          )}
        </Box>
      </Box>

      {/* Modal de Confirmação - Criação de Usuários (Tab 0) */}
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
                Atualizar o status do estudante para "Enrolled" (Matriculado)
              </Typography>
            </li>
            <li>
              <Typography
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
                }}
              >
                Enviar emails com credenciais de acesso (criadas externamente no Google) para cada aluno
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

      {/* Modal de Confirmação - Matrícula CSV (Tab 1) */}
      <Dialog
        open={enrollConfirmModalOpen}
        onClose={handleEnrollConfirmModalClose}
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
          Confirmar Matrícula de Estudantes
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
              mb: 2,
            }}
          >
            Você está prestes a confirmar a matrícula de{" "}
            <strong>{enrollSelectedStudents.length}</strong>{" "}
            {enrollSelectedStudents.length === 1 ? "estudante" : "estudantes"}.
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
                Atualizar o status para "ENROLLED" (Matriculado)
              </Typography>
            </li>
            <li>
              <Typography
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
                }}
              >
                Marcar "added_on_csv" como verdadeiro
              </Typography>
            </li>
            <li>
              <Typography
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
                }}
              >
                Disparar email com credenciais e senha padrão para cada estudante
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
              maxHeight: 200,
              overflowY: "auto",
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
              Estudantes selecionados:
            </Typography>
            {selectedEnrollStudentsData.map((student) => (
              <Typography
                key={student.student_data_id}
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#B0B0B0" : "#4B5563",
                  fontSize: "0.875rem",
                  mb: 0.5,
                }}
              >
                • {student.full_name} ({student.personal_email})
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleEnrollConfirmModalClose}
            disabled={enrollConfirmLoading}
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark" ? "#B0B0B0" : "#6B7280",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEnrollConfirmModalConfirm}
            disabled={enrollConfirmLoading}
            {...primaryButtonStyles}
          >
            {enrollConfirmLoading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              "Confirmar Matrícula"
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
