import { useCallback, useState } from "react";
import type { EnemResult } from "../interfaces/enemResult";
import { enemResultsService } from "../core/http/services/enemResultsService";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export const useEnemResults = () => {
  const [items, setItems] = useState<EnemResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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

  const fetchEnemResults = useCallback(
    async (pOrEvent?: any, s: number = size) => {
      const p = typeof pOrEvent === "number" ? pOrEvent : page;
      setLoading(true);
      setError(null);
      try {
        const response = await enemResultsService.list(p, s);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const itemData = Array.isArray(response.data.data) ? response.data.data : [];
          setItems(itemData);
          setPage(response.data.currentPage || p);
          setSize(response.data.itemsPerPage || s);
          setTotalItems(response.data.totalItems || 0);
          setTotalPages(response.data.totalPages || 0);
          showSnackbar("Dados carregados com sucesso", "success");
          return;
        }

        setItems([]);
        const errorMessage = response.message || "Erro ao carregar resultados do ENEM.";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      } catch (err: any) {
        setItems([]);
        const errorMessage = err.message || "Erro ao carregar resultados do ENEM.";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    },
    [page, size, showSnackbar]
  );

  /**
   * Obtém detalhes de um resultado ENEM específico
   */
  const fetchEnemResultById = useCallback(
    async (id: string | number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await enemResultsService.getById(id);

        if (response.status >= 200 && response.status < 300 && response.data) {
          return response.data;
        } else {
          const errorMessage = response.message || "Erro ao buscar resultado ENEM";
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
          return null;
        }
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao buscar resultado ENEM";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  const updateStatus = useCallback(
    async (id: string, status: string) => {
      try {
        const response = await enemResultsService.updateStatus(id, status);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Status atualizado com sucesso", "success");
          await fetchEnemResults();
          return {
            success: true,
            message: response.message || "Status atualizado com sucesso.",
          };
        }

        const errorMessage = response.message || "Não foi possível atualizar o status.";
        showSnackbar(errorMessage, "error");
        return {
          success: false,
          message: errorMessage,
        };
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao atualizar status do ENEM.";
        showSnackbar(errorMessage, "error");
        return {
          success: false,
          message: errorMessage,
        };
      }
    },
    [fetchEnemResults, showSnackbar]
  );

  /**
   * Cria um novo resultado ENEM
   */
  const createEnemResult = useCallback(
    async (payload: Partial<EnemResult>) => {
      try {
        const response = await enemResultsService.create(payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Resultado ENEM criado com sucesso", "success");
          await fetchEnemResults();
          return response.data;
        } else {
          const errorMessage = response.message || "Erro ao criar resultado ENEM";
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
          return null;
        }
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao criar resultado ENEM";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        return null;
      }
    },
    [fetchEnemResults, showSnackbar]
  );

  /**
   * Deleta um resultado ENEM
   */
  const deleteEnemResult = useCallback(
    async (id: string | number) => {
      try {
        const response = await enemResultsService.delete(id);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Resultado ENEM deletado com sucesso", "success");
          await fetchEnemResults();
          return true;
        } else {
          const errorMessage = response.message || "Erro ao deletar resultado ENEM";
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
          return false;
        }
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao deletar resultado ENEM";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        return false;
      }
    },
    [fetchEnemResults, showSnackbar]
  );

  return { 
    items, 
    loading, 
    error, 
    snackbar, 
    closeSnackbar, 
    fetchEnemResults,
    fetchEnemResultById,
    updateStatus,
    createEnemResult,
    deleteEnemResult,
    page, 
    size, 
    totalItems, 
    totalPages 
  };
};

