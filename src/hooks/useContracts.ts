import { useState, useCallback } from "react";
import { contractsService } from "../core/http/services/contractsService";

// Definindo tipos localmente (também definidos no serviço)
interface Contract {
  id: number;
  status: string;
  user_data: {
    cpf: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
}

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
          return;
        }

        setContracts([]);
        setError(response.message || "Erro ao buscar contratos");
      } catch (err: any) {
        setContracts([]);
        setError(err?.message || "Erro ao buscar contratos");
      } finally {
        setLoading(false);
      }
    },
    [page, size]
  );

  return {
    contracts,
    loading,
    error,
    fetchContracts,
    page,
    size,
    totalItems,
    totalPages,
  };
};


