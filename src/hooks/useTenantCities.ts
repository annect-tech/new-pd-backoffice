import { useState, useCallback } from "react";
import {
  tenantCitiesService,
  type TenantCity,
  type TenantCityPayload,
} from "../core/http/services/tenantCitiesService";

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

export const useTenantCities = () => {
  const [tenantCities, setTenantCities] = useState<TenantCity[]>([]);
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

  const fetchTenantCities = useCallback(
    async (page: number = 1, size: number = 10, search?: string) => {
      setLoading(true);
      try {
        const response = await tenantCitiesService.list(page, size, search);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const raw = response.data as any;
          const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];

          setTenantCities(list);
          setPagination({
            currentPage: Number(raw?.currentPage ?? page),
            itemsPerPage: Number(raw?.itemsPerPage ?? size),
            totalItems: Number(raw?.totalItems ?? list.length),
            totalPages: Number(raw?.totalPages ?? 0),
          });
        } else {
          setTenantCities([]);
          setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
          showSnackbar(
            response.message || "Erro ao buscar tenant cities",
            "error"
          );
        }
      } catch (error: any) {
        setTenantCities([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
        showSnackbar(
          error?.message || "Erro ao buscar tenant cities",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  const createTenantCity = useCallback(
    async (payload: TenantCityPayload) => {
      try {
        const response = await tenantCitiesService.create(payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Tenant City criada com sucesso!", "success");
          // Recarregar lista após criar
          await fetchTenantCities();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao criar tenant city",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(
          error?.message || "Erro ao criar tenant city",
          "error"
        );
        return false;
      }
    },
    [showSnackbar, fetchTenantCities]
  );

  const updateTenantCity = useCallback(
    async (id: string, payload: TenantCityPayload) => {
      try {
        const response = await tenantCitiesService.update(id, payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Tenant City atualizada com sucesso!", "success");
          // Recarregar lista após atualizar
          await fetchTenantCities();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao atualizar tenant city",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(
          error?.message || "Erro ao atualizar tenant city",
          "error"
        );
        return false;
      }
    },
    [showSnackbar, fetchTenantCities]
  );

  const deleteTenantCity = useCallback(
    async (id: string) => {
      try {
        const response = await tenantCitiesService.delete(id);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Tenant City deletada com sucesso!", "success");
          // Recarregar lista após deletar
          await fetchTenantCities();
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao deletar tenant city",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(
          error?.message || "Erro ao deletar tenant city",
          "error"
        );
        return false;
      }
    },
    [showSnackbar, fetchTenantCities]
  );

  return {
    tenantCities,
    loading,
    pagination,
    snackbar,
    closeSnackbar,
    fetchTenantCities,
    createTenantCity,
    updateTenantCity,
    deleteTenantCity,
  };
};
