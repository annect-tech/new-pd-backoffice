import { useState, useCallback } from "react";
import type { ExamScheduled } from "../interfaces/examScheduled";
import { examsScheduledService } from "../core/http/services/examsScheduledService";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export const useExamsScheduled = () => {
  const [exams, setExams] = useState<ExamScheduled[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState["severity"] = "info") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const fetchExams = useCallback(async (pOrEvent?: any, s: number = size) => {
    const p = typeof pOrEvent === "number" ? pOrEvent : page;
    setLoading(true);
    setError(null);
    try {
      const response = await examsScheduledService.list(p, s);

      if (response.status >= 200 && response.status < 300 && response.data) {
        const examData = Array.isArray(response.data.data) ? response.data.data : [];
        setExams(examData);
        setPage(response.data.currentPage || p);
        setSize(response.data.itemsPerPage || s);
        setTotalItems(response.data.totalItems || 0);
        setTotalPages(response.data.totalPages || 0);
        showSnackbar("Dados carregados com sucesso", "success");
      } else {
        setExams([]);
        const errorMessage = response.message || "Erro ao carregar dados";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      }
    } catch (err: any) {
      setExams([]);
      const errorMessage = err.message || "Erro ao carregar dados";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar, page, size]);

  const handleExportCSV = useCallback(() => {
    if (exams.length === 0) {
      showSnackbar("Nenhum dado para exportar", "warning");
      return;
    }

    const headers = ["CPF", "Nome", "Celular", "Status", "Local", "Data", "Hora"];
    const rows = exams.map((exam) => [
      exam.user_data.cpf,
      `${exam.user_data.user.first_name} ${exam.user_data.user.last_name}`,
      exam.user_data.celphone || "Não informado",
      exam.status === "absent" ? "ausente" : exam.status === "scheduled" ? "agendado" : "presente",
      exam.exam_scheduled_hour.exam_date.local.name,
      exam.exam_scheduled_hour.exam_date.date,
      exam.exam_scheduled_hour.hour,
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

  const handleExportXLSX = useCallback(() => {
    showSnackbar("Exportação XLSX em desenvolvimento", "info");
    // TODO: Implementar exportação XLSX usando biblioteca como xlsx
  }, [showSnackbar]);

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
    handleExportCSV,
    handleExportJSON,
    handleExportXLSX,
  };
};


