import { useState, useCallback } from "react";
import type { UserProfile } from "../interfaces/userProfile";
import { selectiveService } from "../core/http/services/selectiveService";

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

export const useSelective = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
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

  const fetchUsers = useCallback(
    async (page: number = 1, size: number = 10, search?: string) => {
      setLoading(true);
      try {
        const response = await selectiveService.list(page, size, search);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const raw = response.data as any;
          // A resposta do backend /user/user-data retorna: { currentPage, itemsPerPage, totalItems, totalPages, data: [] }
          
          let list: any[] = [];
          if (Array.isArray(raw?.data)) {
            list = raw.data;
          } else if (Array.isArray(raw)) {
            list = raw;
          }

          setUsers(list);
          setPagination({
            currentPage: Number(raw?.currentPage ?? raw?.page ?? page),
            itemsPerPage: Number(raw?.itemsPerPage ?? raw?.size ?? size),
            totalItems: Number(raw?.totalItems ?? raw?.total ?? list.length),
            totalPages: Number(raw?.totalPages ?? Math.ceil((raw?.totalItems ?? raw?.total ?? list.length) / (raw?.itemsPerPage ?? raw?.size ?? size))),
          });
          showSnackbar("Dados carregados com sucesso", "success");
        } else {
          setUsers([]);
          setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
          showSnackbar(
            response.message || "Erro ao buscar usuários",
            "error"
          );
        }
      } catch (error: any) {
        setUsers([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
        showSnackbar(
          error?.message || "Erro ao buscar usuários",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  const handleExportCSV = useCallback(() => {
    if (users.length === 0) {
      showSnackbar("Nenhum dado para exportar", "warning");
      return;
    }

    const headers = ["ID", "CPF", "Nome", "Data Nasc.", "Celular", "Email", "Cidade", "UF"];
    const rows = users.map((u) => [
      u.id || "",
      u.cpf || "",
      [u.first_name, u.last_name].filter(Boolean).join(" ") || "",
      u.birth_date || "",
      u.celphone || "",
      u.email || "",
      u.allowed_city?.localidade || u.addresses?.[0]?.localidade || "",
      u.allowed_city?.uf || u.addresses?.[0]?.uf || "",
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
    pagination,
    snackbar,
    closeSnackbar,
    fetchUsers,
    handleExportCSV,
    handleExportJSON,
    handleExportXLSX,
  };
};


