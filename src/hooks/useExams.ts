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

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await examsService.list(page, size);

      if (response.status >= 200 && response.status < 300 && response.data) {
        const examData = Array.isArray(response.data.data) ? response.data.data : [];
        setExams(examData);
        setPage(response.data.currentPage || page);
        setSize(response.data.itemsPerPage || size);
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
      // TODO: Implementar navegação para detalhes
      console.log("Ver detalhes do exame:", selectedRowId);
      handleCloseRowMenu();
    }
  };

  return {
    exams,
    loading,
    error,
    snackbar,
    closeSnackbar,
    fetchExams,
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


