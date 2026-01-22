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

  const fetchMerits = useCallback(async (page: number = 1, _size: number = 10, status?: string) => {
    // Garantir que os parâmetros são números
    const pageNum = typeof page === 'number' ? page : 1;
    const statusFilter = status || "pending";
    
    setLoading(true);
    setError(null);
    try {
      const response = await academicMeritService.list(pageNum, 100, undefined);

      if (response.status >= 200 && response.status < 300 && response.data) {
        const raw = response.data as any;
        let list: AcademicMerit[] = [];
        if (Array.isArray(raw)) {
          list = raw;
        } else if (Array.isArray(raw?.data)) {
          list = raw.data;
        }
        
        if (statusFilter === "pending") {
          list = list.filter((doc: AcademicMerit) => doc.status === "PENDING");
        } else if (statusFilter) {
          list = list.filter((doc: AcademicMerit) => doc.status?.toUpperCase() === statusFilter.toUpperCase());
        }
        
        setMerits(list);
        setPagination({
          currentPage: 1,
          itemsPerPage: list.length,
          totalItems: list.length,
          totalPages: 1,
        });
        setCurrentIndex(0);
        showSnackbar("Dados carregados com sucesso", "success");
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
        showSnackbar("Dados carregados com sucesso", "success");
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
      console.log("Aprovando documento:", {
        id: currentMerit.id,
        user_data_id: currentMerit.user_data_id,
        status: currentMerit.status
      });
      
      const response = await academicMeritService.approve(currentMerit.id);
      
      console.log("Resposta da aprovação:", response);

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Documento aprovado com sucesso", "success");
        // Refresh list
        await fetchMerits(pagination.currentPage, pagination.itemsPerPage, "pending");
      } else {
        let errorMessage = response.message || "Erro ao aprovar documento";
        
        // Se for erro de userData já existente, tratar como sucesso com aviso
        if (errorMessage.includes("Já existe um userData") || errorMessage.includes("userData associado")) {
          showSnackbar("Documento aprovado com sucesso", "success");
          // Mostrar aviso adicional após um pequeno delay
          setTimeout(() => {
            showSnackbar("Aviso: O usuário já possui um registro em seletivo_userdata.", "info");
          }, 500);
          // Refresh list
          await fetchMerits(pagination.currentPage, pagination.itemsPerPage, "pending");
        }
        // Mensagem mais descritiva para erro de user_data_id inválido
        else if (errorMessage.includes("user_data_id inválido") || response.status === 404) {
          errorMessage = `Não foi possível aprovar o documento. O usuário associado (ID: ${currentMerit.user_data_id}) não existe ou não está configurado corretamente no sistema. Verifique os dados do usuário no banco de dados.`;
          console.error("Erro na aprovação:", errorMessage, response);
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
        } else {
          console.error("Erro na aprovação:", errorMessage, response);
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
        }
      }
    } catch (err: any) {
      console.error("Exceção na aprovação:", err);
      const errorMessage = err.message || err.response?.data?.message || "Erro ao aprovar documento";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setActionLoading(false);
    }
  }, [currentMerit, fetchMerits, pagination, showSnackbar]);

  const recuseCurrent = useCallback(async () => {
    if (!currentMerit) return;

    setActionLoading(true);
    try {
      console.log("Reprovando documento:", {
        id: currentMerit.id,
        user_data_id: currentMerit.user_data_id,
        status: currentMerit.status
      });
      
      const response = await academicMeritService.reject(currentMerit.id);
      
      console.log("Resposta da reprovação:", response);

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Documento reprovado com sucesso", "success");
        // Refresh list
        await fetchMerits(pagination.currentPage, pagination.itemsPerPage, "pending");
      } else {
        let errorMessage = response.message || "Erro ao reprovar documento";
        
        // Mensagem mais descritiva para erro de user_data_id inválido
        if (errorMessage.includes("user_data_id inválido") || response.status === 404) {
          errorMessage = `Não foi possível reprovar o documento. O usuário associado (ID: ${currentMerit.user_data_id}) não existe ou não está configurado corretamente no sistema. Verifique os dados do usuário no banco de dados.`;
          console.error("Erro na reprovação:", errorMessage, response);
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
        } else {
          console.error("Erro na reprovação:", errorMessage, response);
          setError(errorMessage);
          showSnackbar(errorMessage, "error");
        }
      }
    } catch (err: any) {
      console.error("Exceção na reprovação:", err);
      const errorMessage = err.message || err.response?.data?.message || "Erro ao reprovar documento";
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

