import { useState, useCallback } from "react";
import type { ExamScheduled } from "../interfaces/examScheduled";
import type { StudentExamStatus, ScheduleGridResponse } from "../interfaces/examScheduleTypes";
import { examsScheduledService } from "../core/http/services/examsScheduledService";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const useExamsScheduled = () => {
  const [exams, setExams] = useState<ExamScheduled[]>([]);
  const [scheduleGrid, setScheduleGrid] = useState<ScheduleGridResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState["severity"] = "info") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  /**
   * Lista todos os alunos inscritos
   * GET /user/student-exams
   */
  const fetchExams = useCallback(
    async (page: number = 1, limit: number = 10, search?: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await examsScheduledService.list(page, limit, search);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const raw = response.data as any;
          
          // A resposta pode vir como array direto ou como objeto paginado
          let list: ExamScheduled[] = [];
          let paginationData: PaginationState;
          
          if (Array.isArray(raw)) {
            list = raw;
            paginationData = {
              currentPage: page,
              itemsPerPage: limit,
              totalItems: raw.length,
              totalPages: Math.ceil(raw.length / limit),
            };
          } else if (raw?.data && Array.isArray(raw.data)) {
            list = raw.data;
            paginationData = {
              currentPage: Number(raw.meta?.page ?? page),
              itemsPerPage: Number(raw.meta?.limit ?? limit),
              totalItems: Number(raw.meta?.total ?? list.length),
              totalPages: Number(raw.meta?.totalPages ?? Math.ceil(list.length / limit)),
            };
          } else {
            list = [];
            paginationData = {
              currentPage: page,
              itemsPerPage: limit,
              totalItems: 0,
              totalPages: 0,
            };
          }

          setExams(list);
          setPagination(paginationData);
          showSnackbar("Dados carregados com sucesso", "success");
        } else {
          setExams([]);
          setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
          const errorMessage = response.message || "Erro ao carregar dados";
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
        }
      } catch (err: any) {
        setExams([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
        const errorMessage = err?.message || "Erro ao carregar dados";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Busca grade de alunos por horário
   * GET /user/student-exams/schedule/:localId/:dateId
   */
  const fetchScheduleGrid = useCallback(
    async (localId: string | number, dateId: string | number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await examsScheduledService.getScheduleGrid(localId, dateId);

        if (response.status >= 200 && response.status < 300 && response.data) {
          setScheduleGrid(response.data);
          showSnackbar("Grade carregada com sucesso", "success");
          return response.data;
        } else {
          setScheduleGrid(null);
          const errorMessage = response.message || "Erro ao carregar grade";
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
          return null;
        }
      } catch (err: any) {
        setScheduleGrid(null);
        const errorMessage = err?.message || "Erro ao carregar grade";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Atualiza status de um aluno
   * PATCH /user/student-exams/:id
   */
  const updateStatus = useCallback(
    async (id: string | number, status: StudentExamStatus) => {
      try {
        const response = await examsScheduledService.updateStatus(id, status);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Status atualizado com sucesso", "success");
          return true;
        } else {
          const errorMessage = response.message || "Erro ao atualizar status";
          showSnackbar(errorMessage, "error");
          return false;
        }
      } catch (err: any) {
        const errorMessage = err?.message || "Erro ao atualizar status";
        showSnackbar(errorMessage, "error");
        return false;
      }
    },
    [showSnackbar]
  );

  /**
   * Atualiza nota de um aluno
   * PATCH /user/student-exams/:id
   */
  const updateScore = useCallback(
    async (id: string | number, score: number) => {
      try {
        const response = await examsScheduledService.updateScore(id, score);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Nota atualizada com sucesso", "success");
          return true;
        } else {
          const errorMessage = response.message || "Erro ao atualizar nota";
          showSnackbar(errorMessage, "error");
          return false;
        }
      } catch (err: any) {
        const errorMessage = err?.message || "Erro ao atualizar nota";
        showSnackbar(errorMessage, "error");
        return false;
      }
    },
    [showSnackbar]
  );

  /**
   * Reagenda um aluno para outro horário
   * PATCH /user/student-exams/:id
   */
  const reschedule = useCallback(
    async (id: string | number, examScheduledHourId: number) => {
      try {
        const response = await examsScheduledService.reschedule(id, examScheduledHourId);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Aluno reagendado com sucesso", "success");
          return true;
        } else {
          const errorMessage = response.message || "Erro ao reagendar aluno";
          showSnackbar(errorMessage, "error");
          return false;
        }
      } catch (err: any) {
        const errorMessage = err?.message || "Erro ao reagendar aluno";
        showSnackbar(errorMessage, "error");
        return false;
      }
    },
    [showSnackbar]
  );

  /**
   * Exporta lista para CSV
   */
  const handleExportCSV = useCallback(() => {
    if (exams.length === 0) {
      showSnackbar("Nenhum dado para exportar", "warning");
      return;
    }

    const headers = ["ID", "User Data ID", "CPF", "Nome", "Celular", "Status", "Local", "Data", "Hora", "Nota"];
    const rows = exams.map((exam) => [
      exam.id || "—",
      exam.user_data_id || "—",
      exam.user_data?.cpf || "—",
      exam.user_data?.user
        ? `${exam.user_data.user.first_name} ${exam.user_data.user.last_name}`
        : "—",
      exam.user_data?.celphone || "Não informado",
      examsScheduledService.getStatusLabel(exam.status),
      exam.exam_scheduled_hour?.exam_date?.local?.name || "—",
      exam.exam_scheduled_hour?.exam_date?.date || "—",
      exam.exam_scheduled_hour?.hour || "—",
      exam.score ?? "—",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lista_presenca_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    showSnackbar("Arquivo CSV exportado com sucesso", "success");
  }, [exams, showSnackbar]);

  /**
   * Exporta lista para JSON
   */
  const handleExportJSON = useCallback(() => {
    if (exams.length === 0) {
      showSnackbar("Nenhum dado para exportar", "warning");
      return;
    }

    const jsonContent = JSON.stringify(exams, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lista_presenca_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    showSnackbar("Arquivo JSON exportado com sucesso", "success");
  }, [exams, showSnackbar]);

  /**
   * Exporta lista para XLSX
   */
  const handleExportXLSX = useCallback(() => {
    showSnackbar("Exportação XLSX em desenvolvimento", "info");
    // TODO: Implementar exportação XLSX usando biblioteca como xlsx
  }, [showSnackbar]);

  return {
    exams,
    scheduleGrid,
    loading,
    error,
    pagination,
    snackbar,
    closeSnackbar,
    fetchExams,
    fetchScheduleGrid,
    updateStatus,
    updateScore,
    reschedule,
    handleExportCSV,
    handleExportJSON,
    handleExportXLSX,
  };
};
