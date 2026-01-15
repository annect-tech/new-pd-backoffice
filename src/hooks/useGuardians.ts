import { useState, useCallback } from "react";
import {
  guardiansService,
  type Guardian,
  type GuardianPayload,
} from "../core/http/services/guardiansService";

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

export const useGuardians = () => {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
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

  /**
   * Lista todos os responsáveis com paginação
   */
  const fetchGuardians = useCallback(
    async (page: number = 1, size: number = 10, search?: string) => {
      setLoading(true);
      try {
        const response = await guardiansService.list(page, size, search);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const guardianData = Array.isArray(response.data.data) ? response.data.data : [];
          setGuardians(guardianData);
          setPagination({
            currentPage: response.data.currentPage || page,
            itemsPerPage: response.data.itemsPerPage || size,
            totalItems: response.data.totalItems || 0,
            totalPages: response.data.totalPages || 0,
          });
        } else {
          setGuardians([]);
          showSnackbar(
            response.message || "Erro ao buscar responsáveis",
            "error"
          );
        }
      } catch (error: any) {
        setGuardians([]);
        showSnackbar(error?.message || "Erro ao buscar responsáveis", "error");
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Cria um novo responsável
   */
  const createGuardian = useCallback(
    async (payload: GuardianPayload) => {
      try {
        const response = await guardiansService.create(payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Responsável criado com sucesso!", "success");
          await fetchGuardians();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao criar responsável",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao criar responsável", "error");
        return false;
      }
    },
    [showSnackbar, fetchGuardians]
  );

  /**
   * Atualiza um responsável existente
   */
  const updateGuardian = useCallback(
    async (id: string | number, payload: Partial<GuardianPayload>) => {
      try {
        const response = await guardiansService.update(id, payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Responsável atualizado com sucesso!", "success");
          await fetchGuardians();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao atualizar responsável",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao atualizar responsável", "error");
        return false;
      }
    },
    [showSnackbar, fetchGuardians]
  );

  /**
   * Deleta um responsável
   */
  const deleteGuardian = useCallback(
    async (id: string | number) => {
      try {
        const response = await guardiansService.delete(id);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Responsável deletado com sucesso!", "success");
          await fetchGuardians();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao deletar responsável",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao deletar responsável", "error");
        return false;
      }
    },
    [showSnackbar, fetchGuardians]
  );

  return {
    guardians,
    loading,
    pagination,
    snackbar,
    closeSnackbar,
    fetchGuardians,
    createGuardian,
    updateGuardian,
    deleteGuardian,
  };
};
