import { useCallback, useState } from "react";
import type { EnemResult } from "../interfaces/enemResult";
import { enemResultsService } from "../core/http/services/enemResultsService";

export const useEnemResults = () => {
  const [items, setItems] = useState<EnemResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
          return;
        }

        setItems([]);
        setError(response.message || "Erro ao carregar resultados do ENEM.");
      } catch (err: any) {
        setItems([]);
        setError(err.message || "Erro ao carregar resultados do ENEM.");
      } finally {
        setLoading(false);
      }
    },
    [page, size]
  );

  const updateStatus = useCallback(
    async (id: string, status: string) => {
      try {
        const response = await enemResultsService.updateStatus(id, status);

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

  return { items, loading, error, fetchEnemResults, updateStatus, page, size, totalItems, totalPages };
};

