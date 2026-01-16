import { useState, useCallback } from "react";
import type { Exam } from "../interfaces/exam";
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
  const [size, setSize] = useState(10);
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

  const fetchExams = useCallback(async (pageParam?: number, sizeParam?: number) => {
    const currentPage = pageParam ?? page;
    const currentSize = sizeParam ?? size;
    
    setLoading(true);
    setError(null);
    try {
      const response = await examsService.list(currentPage, currentSize);

      if (response.status >= 200 && response.status < 300 && response.data) {
        const examData = Array.isArray(response.data.data) ? response.data.data : [];
        setExams(examData);
        setPage(response.data.currentPage || currentPage);
        setSize(response.data.itemsPerPage || currentSize);
        setTotalItems(response.data.totalItems || 0);
        setTotalPages(response.data.totalPages || 0);
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
  }, [page, size, showSnackbar]);

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
   * Obtém detalhes de um exame específico
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
   * Atualiza o status de um exame
   */
  const updateStatus = useCallback(
    async (id: string | number, status: string) => {
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
   * Atualiza a nota de um exame
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
    page,
    size,
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


