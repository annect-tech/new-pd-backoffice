import { useState, useCallback } from "react";
import { contractsService } from "../core/http/services/contractsService";

// Definindo tipos localmente (também definidos no serviço)
interface Contract {
  id: string;
  status: string;
  user_data_id: string;
  student_name: string;
  student_email: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
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

  const fetchContracts = useCallback(
    async (pOrEvent?: any, s: number = size) => {
      const p = typeof pOrEvent === "number" ? pOrEvent : page;
      setLoading(true);
      setError(null);
      try {
        const response = await contractsService.list(p, s);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const contractData = Array.isArray(response.data.data) ? response.data.data : [];
          setContracts(contractData);
          setPage(response.data.currentPage || p);
          setSize(response.data.itemsPerPage || s);
          setTotalItems(response.data.totalItems || 0);
          setTotalPages(response.data.totalPages || 0);
          showSnackbar("Dados carregados com sucesso", "success");
          return;
        }

        setContracts([]);
        const errorMessage = response.message || "Erro ao buscar contratos";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      } catch (err: any) {
        setContracts([]);
        const errorMessage = err?.message || "Erro ao buscar contratos";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    },
    [page, size, showSnackbar]
  );

  /**
   * Obtém detalhes de um contrato específico
   */
  const fetchContractById = useCallback(
    async (id: string | number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await contractsService.getById(id);

        if (response.status >= 200 && response.status < 300 && response.data) {
          return response.data;
        } else {
          const errorMessage = response.message || "Erro ao buscar contrato";
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
          return null;
        }
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao buscar contrato";
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
   * Atualiza o status de um contrato
   */
  const updateStatus = useCallback(
    async (id: string | number, status: string) => {
      try {
        const response = await contractsService.updateStatus(id, status);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Status atualizado com sucesso", "success");
          await fetchContracts();
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
    [fetchContracts, showSnackbar]
  );

  /**
   * Cria um novo contrato
   */
  const createContract = useCallback(
    async (payload: Partial<Contract>) => {
      try {
        // Garantir que user_data_id seja um número
        if (!payload.user_data_id) {
          throw new Error("user_data_id é obrigatório");
        }
        const userDataId = typeof payload.user_data_id === 'string' 
          ? parseInt(payload.user_data_id, 10) 
          : payload.user_data_id;
        
        if (isNaN(userDataId)) {
          throw new Error("user_data_id deve ser um número válido");
        }
        
        const response = await contractsService.create({ user_data_id: userDataId });

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Contrato criado com sucesso", "success");
          await fetchContracts();
          return response.data;
        } else {
          const errorMessage = response.message || "Erro ao criar contrato";
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
          return null;
        }
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao criar contrato";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        return null;
      }
    },
    [fetchContracts, showSnackbar]
  );

  /**
   * Deleta um contrato
   */
  const deleteContract = useCallback(
    async (id: string | number) => {
      try {
        const response = await contractsService.delete(id);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Contrato deletado com sucesso", "success");
          await fetchContracts();
          return true;
        } else {
          const errorMessage = response.message || "Erro ao deletar contrato";
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
          return false;
        }
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao deletar contrato";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        return false;
      }
    },
    [fetchContracts, showSnackbar]
  );

  return {
    contracts,
    loading,
    error,
    snackbar,
    closeSnackbar,
    fetchContracts,
    fetchContractById,
    updateStatus,
    createContract,
    deleteContract,
    page,
    size,
    totalItems,
    totalPages,
  };
};


