import { useState, useCallback } from "react";
import type { UserProfile } from "../interfaces/userProfile";
import { selectiveService } from "../core/http/services/selectiveService";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export const useSelective = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
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

  const fetchUsers = useCallback(
    async (pOrEvent?: any, s: number = size) => {
      const p = typeof pOrEvent === "number" ? pOrEvent : page;
      setLoading(true);
      try {
        const response = await selectiveService.list(p, s);

        if (response.status >= 200 && response.status < 300 && response.data) {
          // Garantir que response.data.data é um array
          const userData = Array.isArray(response.data.data) ? response.data.data : [];
          setUsers(userData);
          setPage(response.data.currentPage || p);
          setSize(response.data.itemsPerPage || s);
          setTotalItems(response.data.totalItems || 0);
          setTotalPages(response.data.totalPages || 0);
          showSnackbar("Dados carregados com sucesso", "success");
        } else {
          // Em caso de erro, limpar os usuários para um array vazio
          setUsers([]);
          showSnackbar(response.message || "Erro ao carregar dados", "error");
        }
      } catch (error: any) {
        // Em caso de exceção, limpar os usuários para um array vazio
        setUsers([]);
        showSnackbar(
          error.message || "Erro ao carregar dados",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar, page, size]
  );

  const handleExportCSV = useCallback(() => {
    if (users.length === 0) {
      showSnackbar("Nenhum dado para exportar", "warning");
      return;
    }

    const headers = ["ID", "CPF", "Nome", "Data Nasc.", "Celular", "Email", "Cidade", "UF"];
    const rows = users.map((u) => [
      u.id,
      u.cpf,
      `${u.first_name} ${u.last_name}`,
      u.birth_date,
      u.celphone,
      u.email,
      u.allowed_city.localidade,
      u.allowed_city.uf,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `seletivo_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    showSnackbar("Arquivo CSV exportado com sucesso", "success");
  }, [users, showSnackbar]);

  const handleExportJSON = useCallback(() => {
    if (users.length === 0) {
      showSnackbar("Nenhum dado para exportar", "warning");
      return;
    }

    const jsonContent = JSON.stringify(users, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `seletivo_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    showSnackbar("Arquivo JSON exportado com sucesso", "success");
  }, [users, showSnackbar]);

  const handleExportXLSX = useCallback(() => {
    showSnackbar("Exportação XLSX em desenvolvimento", "info");
    // TODO: Implementar exportação XLSX usando biblioteca como xlsx
  }, [showSnackbar]);

  return {
    users,
    loading,
    snackbar,
    closeSnackbar,
    fetchUsers,
    page,
    size,
    totalItems,
    totalPages,
    handleExportCSV,
    handleExportJSON,
    handleExportXLSX,
  };
};


