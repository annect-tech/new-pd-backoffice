import { useState, useCallback, useMemo } from "react";
import type { AcademicMerit } from "../interfaces/academicMerit";
import { academicMeritService } from "../core/http/services/academicMeritService";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export const useAcademicMerit = () => {
  const [merits, setMerits] = useState<AcademicMerit[]>([]);
  const [allMerits, setAllMerits] = useState<AcademicMerit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
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

  const fetchMerits = useCallback(async (page: number = 1, size: number = 10, status?: string) => {
    // Garantir que os parâmetros são números
    const pageNum = typeof page === 'number' ? page : 1;
    const sizeNum = typeof size === 'number' ? size : 10;
    
    setLoading(true);
    setError(null);
    try {
      console.log("[useAcademicMerit] fetchMerits - página:", pageNum, "tamanho:", sizeNum, "status:", status || "pending");
      // Use paginated list filtered by pending status
      const response = await academicMeritService.list(pageNum, sizeNum, status || "pending");
      
      console.log("[useAcademicMerit] Resposta fetchMerits:", {
        status: response.status,
        hasData: !!response.data,
        dataType: typeof response.data,
      });

      if (response.status >= 200 && response.status < 300 && response.data) {
        const raw = response.data as any;
        const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        
        setMerits(list);
        setPagination({
          currentPage: Number(raw?.currentPage ?? page),
          itemsPerPage: Number(raw?.itemsPerPage ?? size),
          totalItems: Number(raw?.totalItems ?? list.length),
          totalPages: Number(raw?.totalPages ?? 0),
        });
        setCurrentIndex(0);
      } else {
        setMerits([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
        const errorMessage = response.message || "Erro ao carregar documentos";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      }
    } catch (err: any) {
      setMerits([]);
      setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
      const errorMessage = err?.message || "Erro ao carregar documentos";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const fetchAllMerits = useCallback(async (page: number = 1, size: number = 1000) => {
    // Garantir que os parâmetros são números
    const pageNum = typeof page === 'number' ? page : 1;
    const sizeNum = typeof size === 'number' ? size : 1000;
    
    setLoading(true);
    setError(null);
    try {
      const response = await academicMeritService.list(pageNum, sizeNum);
      
      if (response.status >= 200 && response.status < 300 && response.data) {
        const raw = response.data as any;
        
        // A API pode retornar:
        // 1. Objeto com { data: [...], currentPage, itemsPerPage, ... } (PaginatedResponse)
        // 2. Array direto [...]
        let list: AcademicMerit[] = [];
        
        if (Array.isArray(raw)) {
          // Caso 2: Array direto
          list = raw;
        } else if (raw?.data && Array.isArray(raw.data)) {
          // Caso 1: Objeto PaginatedResponse
          list = raw.data;
        }
        
        setAllMerits(list);
      } else {
        setAllMerits([]);
        const errorMessage = response.message || "Erro ao carregar documentos";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      }
    } catch (err: any) {
      setAllMerits([]);
      const errorMessage = err?.message || "Erro ao carregar documentos";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const currentMerit = useMemo(() => {
    return merits[currentIndex] || null;
  }, [merits, currentIndex]);

  const count = merits.length;

  const next = useCallback(() => {
    if (currentIndex < count - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, count]);

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const approveCurrent = useCallback(async () => {
    if (!currentMerit) return;

    setActionLoading(true);
    try {
      const response = await academicMeritService.approve(currentMerit.id);

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Documento aprovado com sucesso", "success");
        // Refresh list
        await fetchMerits(pagination.currentPage, pagination.itemsPerPage, "pending");
      } else {
        const errorMessage = response.message || "Erro ao aprovar documento";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao aprovar documento";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setActionLoading(false);
    }
  }, [currentMerit, fetchMerits]);

  const recuseCurrent = useCallback(async () => {
    if (!currentMerit) return;

    setActionLoading(true);
    try {
      const response = await academicMeritService.reject(currentMerit.id);

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Documento reprovado com sucesso", "success");
        // Refresh list
        await fetchMerits(pagination.currentPage, pagination.itemsPerPage, "pending");
      } else {
        const errorMessage = response.message || "Erro ao reprovar documento";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao reprovar documento";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setActionLoading(false);
    }
  }, [currentMerit, fetchMerits, pagination, showSnackbar]);

  /**
   * Obtém detalhes de um documento de mérito acadêmico específico
   */
  const fetchMeritById = useCallback(
    async (id: string | number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await academicMeritService.getById(id);

        if (response.status >= 200 && response.status < 300 && response.data) {
          return response.data;
        } else {
          const errorMessage = response.message || "Erro ao buscar documento";
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
          return null;
        }
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao buscar documento";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  return {
    loading,
    error,
    actionLoading,
    count,
    currentIndex,
    currentMerit,
    allMerits,
    pagination,
    snackbar,
    closeSnackbar,
    approveCurrent,
    recuseCurrent,
    next,
    prev,
    fetchMerits,
    fetchAllMerits,
    fetchMeritById,
  };
};

