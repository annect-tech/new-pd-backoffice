import { useState, useCallback } from "react";
import type { Exam } from "../interfaces/exam";
import type { StudentExamStatus } from "../interfaces/examScheduleTypes";
import { examsService } from "../core/http/services/examsService";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export const useExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [generalAnchor, setGeneralAnchor] = useState<null | HTMLElement>(null);
  const [rowAnchor, setRowAnchor] = useState<null | HTMLElement>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
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
  const fetchExams = useCallback(async (pageParam?: number, limitParam?: number, search?: string) => {
    const currentPage = pageParam ?? page;
    const currentLimit = limitParam ?? limit;
    
    setLoading(true);
    setError(null);
    try {
      const response = await examsService.list(currentPage, currentLimit, search);

      if (response.status >= 200 && response.status < 300 && response.data) {
        const raw = response.data as any;
        
        // A resposta pode vir paginada conforme documentação
        let examData: Exam[] = [];
        let meta = {
          total: 0,
          page: currentPage,
          limit: currentLimit,
          totalPages: 0,
        };

        if (Array.isArray(raw)) {
          examData = raw;
          meta.total = raw.length;
          meta.totalPages = Math.ceil(raw.length / currentLimit);
        } else if (raw?.data && Array.isArray(raw.data)) {
          examData = raw.data;
          meta = {
            total: Number(raw.meta?.total ?? raw.data.length),
            page: Number(raw.meta?.page ?? currentPage),
            limit: Number(raw.meta?.limit ?? currentLimit),
            totalPages: Number(raw.meta?.totalPages ?? Math.ceil(raw.data.length / currentLimit)),
          };
        }

        setExams(examData);
        setPage(meta.page);
        setLimit(meta.limit);
        setTotalItems(meta.total);
        setTotalPages(meta.totalPages);
        showSnackbar("Dados carregados com sucesso", "success");
      } else {
        setExams([]);
        const errorMessage = response.message || "Erro ao carregar exames";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      }
    } catch (err: any) {
      setExams([]);
      const errorMessage = err.message || "Erro ao carregar exames";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [page, limit, showSnackbar]);

  const handleOpenGeneralMenu = (event: React.MouseEvent<HTMLElement>) => {
    setGeneralAnchor(event.currentTarget);
  };

  const handleCloseGeneralMenu = () => {
    setGeneralAnchor(null);
  };

  const handleOpenRowMenu = (event: React.MouseEvent<HTMLElement>, rowId: number) => {
    event.stopPropagation();
    setRowAnchor(event.currentTarget);
    setSelectedRowId(rowId);
  };

  const handleCloseRowMenu = () => {
    setRowAnchor(null);
    setSelectedRowId(null);
  };

  const goToDetail = () => {
    if (selectedRowId) {
      handleCloseRowMenu();
    }
  };

  /**
   * Busca inscrição de aluno por ID
   * GET /user/student-exams/:id
   */
  const fetchExamById = useCallback(
    async (id: string | number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await examsService.getById(id);

        if (response.status >= 200 && response.status < 300 && response.data) {
          return response.data;
        } else {
          const errorMessage = response.message || "Erro ao buscar exame";
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
          return null;
        }
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao buscar exame";
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
   * Atualiza o status de um aluno
   * PATCH /user/student-exams/:id
   */
  const updateStatus = useCallback(
    async (id: string | number, status: StudentExamStatus) => {
      try {
        const response = await examsService.updateStatus(id, status);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Status atualizado com sucesso", "success");
          await fetchExams();
          return true;
        } else {
          const errorMessage = response.message || "Erro ao atualizar status";
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
          return false;
        }
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao atualizar status";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        return false;
      }
    },
    [fetchExams, showSnackbar]
  );

  /**
   * Atualiza a nota de um aluno
   * PATCH /user/student-exams/:id
   */
  const updateScore = useCallback(
    async (id: string | number, score: number) => {
      try {
        const response = await examsService.updateScore(id, score);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Nota atualizada com sucesso", "success");
          await fetchExams();
          return true;
        } else {
          const errorMessage = response.message || "Erro ao atualizar nota";
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
          return false;
        }
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao atualizar nota";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        return false;
      }
    },
    [fetchExams, showSnackbar]
  );

  /**
   * Inscreve um aluno no processo seletivo
   * POST /user/student-exams
   */
  const createExam = useCallback(
    async (userDataId: number, examScheduledHourId?: number | null) => {
      setLoading(true);
      try {
        const response = await examsService.create(userDataId, examScheduledHourId);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Aluno inscrito com sucesso", "success");
          await fetchExams();
          return response.data;
        } else {
          const errorMessage = response.message || "Erro ao inscrever aluno";
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
          return null;
        }
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao inscrever aluno";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchExams, showSnackbar]
  );

  /**
   * Remove inscrição de aluno
   * DELETE /user/student-exams/:id
   */
  const deleteExam = useCallback(
    async (id: string | number) => {
      try {
        const response = await examsService.delete(id);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Inscrição removida com sucesso", "success");
          await fetchExams();
          return true;
        } else {
          const errorMessage = response.message || "Erro ao remover inscrição";
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
          return false;
        }
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao remover inscrição";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        return false;
      }
    },
    [fetchExams, showSnackbar]
  );

  /**
   * Reagenda um aluno para outro horário
   * PATCH /user/student-exams/:id
   */
  const reschedule = useCallback(
    async (id: string | number, examScheduledHourId: number) => {
      try {
        const response = await examsService.reschedule(id, examScheduledHourId);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Aluno reagendado com sucesso", "success");
          await fetchExams();
          return true;
        } else {
          const errorMessage = response.message || "Erro ao reagendar aluno";
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
          return false;
        }
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao reagendar aluno";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        return false;
      }
    },
    [fetchExams, showSnackbar]
  );

  return {
    exams,
    loading,
    error,
    snackbar,
    closeSnackbar,
    fetchExams,
    fetchExamById,
    updateStatus,
    updateScore,
    createExam,
    deleteExam,
    reschedule,
    page,
    limit,
    totalItems,
    totalPages,
    generalAnchor,
    rowAnchor,
    modalOpen,
    setModalOpen,
    handleOpenGeneralMenu,
    handleCloseGeneralMenu,
    handleOpenRowMenu,
    handleCloseRowMenu,
    goToDetail,
  };
};
