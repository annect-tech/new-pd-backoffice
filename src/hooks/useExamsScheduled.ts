import { useState, useCallback } from "react";
import type { ExamScheduled } from "../interfaces/examScheduled";

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
      // TODO: Substituir pelo endpoint real da API
      // const response = await httpClient.get<ExamScheduled[]>(API_URL, "/exams-scheduled/");
      
      // Dados mockados para demonstração
      const mockExams: ExamScheduled[] = [
        {
          id: 1,
          score: 85,
          status: "present",
          user_data: {
            cpf: "123.456.789-00",
            celphone: "(11) 98765-4321",
            user: {
              first_name: "João",
              last_name: "Silva",
            },
          },
          exam_scheduled_hour: {
            hour: "08:00",
            exam_date: {
              date: "2024-03-15",
              local: {
                name: "Centro de Convenções",
              },
            },
          },
        },
        {
          id: 2,
          score: 90,
          status: "present",
          user_data: {
            cpf: "987.654.321-00",
            celphone: "(11) 97654-3210",
            user: {
              first_name: "Maria",
              last_name: "Santos",
            },
          },
          exam_scheduled_hour: {
            hour: "08:00",
            exam_date: {
              date: "2024-03-15",
              local: {
                name: "Centro de Convenções",
              },
            },
          },
        },
        {
          id: 3,
          status: "absent",
          user_data: {
            cpf: "456.789.123-00",
            celphone: "(11) 96543-2109",
            user: {
              first_name: "Pedro",
              last_name: "Oliveira",
            },
          },
          exam_scheduled_hour: {
            hour: "08:00",
            exam_date: {
              date: "2024-03-15",
              local: {
                name: "Centro de Convenções",
              },
            },
          },
        },
        {
          id: 4,
          score: 75,
          status: "scheduled",
          user_data: {
            cpf: "789.123.456-00",
            celphone: "(11) 95432-1098",
            user: {
              first_name: "Ana",
              last_name: "Costa",
            },
          },
          exam_scheduled_hour: {
            hour: "14:00",
            exam_date: {
              date: "2024-03-15",
              local: {
                name: "Auditório Principal",
              },
            },
          },
        },
        {
          id: 5,
          status: "absent",
          user_data: {
            cpf: "321.654.987-00",
            celphone: "(11) 94321-0987",
            user: {
              first_name: "Carlos",
              last_name: "Souza",
            },
          },
          exam_scheduled_hour: {
            hour: "14:00",
            exam_date: {
              date: "2024-03-15",
              local: {
                name: "Auditório Principal",
              },
            },
          },
        },
      ];

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setExams(mockExams);
      showSnackbar("Dados carregados com sucesso", "success");
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao carregar dados";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

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
    handleExportCSV,
    handleExportJSON,
    handleExportXLSX,
  };
};


