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

export const useCities = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
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
    async (pOrEvent?: any, size: number = 100, search?: string) => {
      // if called as an event handler (onClick), the first arg will be an event
      const page = typeof pOrEvent === "number" ? pOrEvent : 1;
      setLoading(true);
      try {
        const response = await citiesService.list(page, size, search);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const cityData = Array.isArray(response.data.data) ? response.data.data : [];
          setCities(cityData);
        } else {
          setCities([]);
          showSnackbar(
            response.message || "Erro ao buscar cidades",
            "error"
          );
        }
      } catch (error: any) {
        setCities([]);
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
          await fetchCities();
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
    [showSnackbar, fetchCities]
  );

  const updateCity = useCallback(
    async (id: string, payload: Partial<CityDataPayload>) => {
      try {
        const response = await citiesService.update(id, payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Cidade atualizada com sucesso!", "success");
          // Recarregar lista após atualizar
          await fetchCities();
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
    [showSnackbar, fetchCities]
  );

  return {
    cities,
    loading,
    snackbar,
    closeSnackbar,
    fetchCities,
    createCity,
    updateCity,
  };
};

