import { useState, useCallback } from "react";
import type { ExamScheduled } from "../interfaces/examScheduled";
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

  const fetchExams = useCallback(
    async (page: number = 1, size: number = 10, search?: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await examsScheduledService.list(page, size, search);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const raw = response.data as any;
          
          // A resposta pode vir como array direto ou como objeto com propriedade data
          let list: any[] = [];
          let paginationData: any = {};
          
          if (Array.isArray(raw)) {
            // Se a resposta é um array direto
            list = raw;
            paginationData = {
              currentPage: page,
              itemsPerPage: size,
              totalItems: raw.length,
              totalPages: Math.ceil(raw.length / size),
            };
          } else if (Array.isArray(raw?.data)) {
            // Se a resposta tem estrutura paginada
            list = raw.data;
            paginationData = {
              currentPage: Number(raw?.currentPage ?? page),
              itemsPerPage: Number(raw?.itemsPerPage ?? size),
              totalItems: Number(raw?.totalItems ?? list.length),
              totalPages: Number(raw?.totalPages ?? 0),
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

  const handleExportCSV = useCallback(() => {
    if (exams.length === 0) {
      showSnackbar("Nenhum dado para exportar", "warning");
      return;
    }

    const headers = ["ID", "User Data ID", "CPF", "Nome", "Celular", "Status", "Local", "Data", "Hora", "Nota"];
    const rows = exams.map((exam: any) => [
      exam.id || "—",
      exam.user_data_id || "—",
      // Tenta acessar dados completos (se disponíveis), caso contrário usa fallbacks
      exam.user_data?.cpf || "—",
      exam.user_data?.user
        ? `${exam.user_data.user.first_name} ${exam.user_data.user.last_name}`
        : exam.user_data?.username || "—",
      exam.user_data?.celphone || "Não informado",
      exam.status === "absent" ? "ausente" : exam.status === "scheduled" ? "agendado" : "presente",
      exam.exam_scheduled_hour?.exam_date?.local?.name || 
      exam.exam_schedule_info?.local_name || "—",
      exam.exam_scheduled_hour?.exam_date?.date || 
      exam.exam_schedule_info?.date || "—",
      exam.exam_scheduled_hour?.hour || 
      exam.exam_schedule_info?.hour || "—",
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
    pagination,
    snackbar,
    closeSnackbar,
    fetchExams,
    handleExportCSV,
    handleExportJSON,
    handleExportXLSX,
  };
};


