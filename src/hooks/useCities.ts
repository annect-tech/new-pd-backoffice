import { useState, useCallback } from "react";
import {
  citiesService,
  type City,
  type CityDataPayload,
} from "../core/http/services/citiesService";

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

export const useCities = () => {
  const [cities, setCities] = useState<City[]>([]);
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

  const fetchCities = useCallback(
    async (page: number = 1, size: number = 10, search?: string) => {
      setLoading(true);
      try {
        const response = await citiesService.list(page, size, search);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const raw = response.data as any;
          const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];

          setCities(list);
          setPagination({
            currentPage: Number(raw?.currentPage ?? page),
            itemsPerPage: Number(raw?.itemsPerPage ?? size),
            totalItems: Number(raw?.totalItems ?? list.length),
            totalPages: Number(raw?.totalPages ?? 0),
          });
        } else {
          setCities([]);
          setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
          showSnackbar(
            response.message || "Erro ao buscar cidades",
            "error"
          );
        }
      } catch (error: any) {
        setCities([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
        showSnackbar(error?.message || "Erro ao buscar cidades", "error");
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  const createCity = useCallback(
    async (payload: CityDataPayload) => {
      try {
        const response = await citiesService.create(payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Cidade criada com sucesso!", "success");
          // Recarregar lista após criar
          await fetchCities(pagination.currentPage, pagination.itemsPerPage);
        } else {
          showSnackbar(
            response.message || "Erro ao criar cidade",
            "error"
          );
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao criar cidade", "error");
      }
    },
    [showSnackbar, fetchCities, pagination]
  );

  const updateCity = useCallback(
    async (id: string, payload: Partial<CityDataPayload>) => {
      try {
        const response = await citiesService.update(id, payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Cidade atualizada com sucesso!", "success");
          // Recarregar lista após atualizar
          await fetchCities(pagination.currentPage, pagination.itemsPerPage);
        } else {
          showSnackbar(
            response.message || "Erro ao atualizar cidade",
            "error"
          );
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao atualizar cidade", "error");
      }
    },
    [showSnackbar, fetchCities, pagination]
  );

  return {
    cities,
    loading,
    pagination,
    snackbar,
    closeSnackbar,
    fetchCities,
    createCity,
    updateCity,
  };
};

