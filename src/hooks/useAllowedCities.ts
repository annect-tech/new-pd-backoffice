import { useState, useCallback } from "react";
import {
  allowedCitiesService,
  type AllowedCity,
  type AllowedCityPayload,
} from "../core/http/services/allowedCitiesService";

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

export const useAllowedCities = () => {
  const [allowedCities, setAllowedCities] = useState<AllowedCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
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

  const fetchAllowedCities = useCallback(
    async (page: number = 1, size: number = 10, search?: string) => {
      setLoading(true);
      try {
        const response = await allowedCitiesService.list(page, size, search);

        if (response.status >= 200 && response.status < 300 && response.data) {
          setFetchError(null);
          const raw = response.data as any;
          const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];

          setAllowedCities(list);
          setPagination({
            currentPage: Number(raw?.currentPage ?? page),
            itemsPerPage: Number(raw?.itemsPerPage ?? size),
            totalItems: Number(raw?.totalItems ?? list.length),
            totalPages: Number(raw?.totalPages ?? 0),
          });
          showSnackbar("Dados carregados com sucesso", "success");
        } else {
          setAllowedCities([]);
          setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
          // Mensagem amigável para erro "Cidade inválida" (400) - usuário sem tenant_city válido
          const msg = response.message || "";
          const friendlyMsg =
            msg.toLowerCase().includes("cidade inválida") || response.status === 400
              ? "Para acessar as cidades permitidas, seu usuário precisa estar vinculado a uma cidade (tenant) válida. Entre em contato com o administrador do sistema."
              : msg || "Erro ao buscar cidades permitidas";
          setFetchError(friendlyMsg);
          showSnackbar(friendlyMsg, "error");
        }
      } catch (error: any) {
        setAllowedCities([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
        const msg = error?.message || "";
        const friendlyMsg =
          msg.toLowerCase().includes("cidade inválida")
            ? "Para acessar as cidades permitidas, seu usuário precisa estar vinculado a uma cidade (tenant) válida. Entre em contato com o administrador do sistema."
            : msg || "Erro ao buscar cidades permitidas";
        setFetchError(friendlyMsg);
        showSnackbar(friendlyMsg, "error");
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  const createAllowedCity = useCallback(
    async (payload: AllowedCityPayload) => {
      try {
        const response = await allowedCitiesService.create(payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Cidade permitida criada com sucesso!", "success");
          // Recarregar lista após criar
          await fetchAllowedCities();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao criar cidade permitida",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(
          error?.message || "Erro ao criar cidade permitida",
          "error"
        );
        return false;
      }
    },
    [showSnackbar, fetchAllowedCities]
  );

  const updateAllowedCity = useCallback(
    async (id: string, payload: Partial<AllowedCityPayload>) => {
      try {
        const response = await allowedCitiesService.update(id, payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Cidade permitida atualizada com sucesso!", "success");
          // Recarregar lista após atualizar
          await fetchAllowedCities();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao atualizar cidade permitida",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(
          error?.message || "Erro ao atualizar cidade permitida",
          "error"
        );
        return false;
      }
    },
    [showSnackbar, fetchAllowedCities]
  );

  const deleteAllowedCity = useCallback(
    async (id: string) => {
      try {
        const response = await allowedCitiesService.delete(id);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Cidade permitida deletada com sucesso!", "success");
          // Recarregar lista após deletar
          await fetchAllowedCities();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao deletar cidade permitida",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(
          error?.message || "Erro ao deletar cidade permitida",
          "error"
        );
        return false;
      }
    },
    [showSnackbar, fetchAllowedCities]
  );

  return {
    allowedCities,
    loading,
    pagination,
    snackbar,
    closeSnackbar,
    fetchAllowedCities,
    createAllowedCity,
    updateAllowedCity,
    deleteAllowedCity,
    fetchError,
  };
};
