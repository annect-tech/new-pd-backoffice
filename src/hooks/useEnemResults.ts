import { useCallback, useState } from "react";
import { httpClient } from "../core/http/httpClient";
import type { EnemResult } from "../interfaces/enemResult";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export const useEnemResults = () => {
  const [items, setItems] = useState<EnemResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnemResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!API_URL) {
        setError("URL da API não configurada (VITE_API_URL).");
        return;
      }

      const response = await httpClient.get<EnemResult[]>(
        API_URL,
        "/admin/enem-results"
      );

      if (response.status >= 200 && response.status < 300 && response.data) {
        setItems(response.data);
        return;
      }

      setError(response.message || "Erro ao carregar resultados do ENEM.");
    } catch (err: any) {
      setError(err.message || "Erro ao carregar resultados do ENEM.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(
    async (id: string, status: string) => {
      try {
        if (!API_URL) {
          return {
            success: false,
            message: "URL da API não configurada (VITE_API_URL).",
          };
        }

        const response = await httpClient.patch<{ message: string }>(
          API_URL,
          "/admin/enem-results",
          id,
          { status }
        );

        if (response.status >= 200 && response.status < 300) {
          await fetchEnemResults();
          return {
            success: true,
            message: response.message || "Status atualizado com sucesso.",
          };
        }

        return {
          success: false,
          message: response.message || "Não foi possível atualizar o status.",
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || "Erro ao atualizar status do ENEM.",
        };
      }
    },
    [fetchEnemResults]
  );

  return { items, loading, error, fetchEnemResults, updateStatus };
};

