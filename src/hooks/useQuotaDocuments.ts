import { useState, useCallback, useMemo } from "react";
import type { QuotaDocument } from "../interfaces/quotaDocument";
import { quotaDocumentsService } from "../core/http/services/quotaDocumentsService";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export const useQuotaDocuments = () => {
  const [documents, setDocuments] = useState<QuotaDocument[]>([]);
  const [allDocuments, setAllDocuments] = useState<QuotaDocument[]>([]);
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

  const fetchDocuments = useCallback(async (page: number = 1, size: number = 10, status?: string) => {
    const pageNum = typeof page === 'number' ? page : 1;
    const sizeNum = typeof size === 'number' ? size : 10;
    const statusFilter = status || "pending";
    
    setLoading(true);
    setError(null);
    try {
      const response = await quotaDocumentsService.list(pageNum, 100);

      if (response.status >= 200 && response.status < 300 && response.data) {
        const raw = response.data as any;
        let list: QuotaDocument[] = [];
        
        // A resposta pode vir como PaginatedResponse ou array direto
        if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray(raw.data)) {
          // É PaginatedResponse
          list = raw.data;
          setPagination({
            currentPage: raw.currentPage || pageNum,
            itemsPerPage: raw.itemsPerPage || sizeNum,
            totalItems: raw.totalItems || raw.data.length,
            totalPages: raw.totalPages || 1,
          });
        } else if (Array.isArray(raw)) {
          // É array direto
          list = raw;
          setPagination({
            currentPage: 1,
            itemsPerPage: list.length,
            totalItems: list.length,
            totalPages: 1,
          });
        }
        
        // Filtrar por status se necessário
        if (statusFilter === "pending") {
          list = list.filter((doc: QuotaDocument) => 
            doc.quota_doc_status?.toUpperCase() === "PENDING" || 
            !doc.quota_doc_status
          );
        } else if (statusFilter) {
          list = list.filter((doc: QuotaDocument) => 
            doc.quota_doc_status?.toUpperCase() === statusFilter.toUpperCase()
          );
        }
        
        setDocuments(list);
        setCurrentIndex(0);
        if (list.length > 0) {
          showSnackbar("Dados carregados com sucesso", "success");
        }
      } else {
        setDocuments([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
        const errorMessage = response.message || "Erro ao carregar documentos";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      }
    } catch (err: any) {
      setDocuments([]);
      setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
      const errorMessage = err?.message || "Erro ao carregar documentos";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const fetchAllDocuments = useCallback(async (page: number = 1, size: number = 1000) => {
    const pageNum = typeof page === 'number' ? page : 1;
    const sizeNum = typeof size === 'number' ? size : 1000;
    
    setLoading(true);
    setError(null);
    try {
      const response = await quotaDocumentsService.list(pageNum, sizeNum);
      
      if (response.status >= 200 && response.status < 300 && response.data) {
        const raw = response.data as any;
        
        let list: QuotaDocument[] = [];
        
        if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray(raw.data)) {
          list = raw.data;
        } else if (Array.isArray(raw)) {
          list = raw;
        }
        
        setAllDocuments(list);
        showSnackbar("Dados carregados com sucesso", "success");
      } else {
        setAllDocuments([]);
        const errorMessage = response.message || "Erro ao carregar documentos";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      }
    } catch (err: any) {
      setAllDocuments([]);
      const errorMessage = err?.message || "Erro ao carregar documentos";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const currentDocument = useMemo(() => {
    return documents[currentIndex] || null;
  }, [documents, currentIndex]);

  const count = documents.length;

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
    if (!currentDocument) return;

    setActionLoading(true);
    try {
      const response = await quotaDocumentsService.update(
        currentDocument.id,
        "APPROVED",
        undefined,
        currentDocument.user_data_id
      );

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Documento aprovado com sucesso", "success");
        await fetchDocuments(pagination.currentPage, pagination.itemsPerPage, "pending");
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
  }, [currentDocument, fetchDocuments, pagination, showSnackbar]);

  const recuseCurrent = useCallback(async () => {
    if (!currentDocument) return;

    setActionLoading(true);
    try {
      const response = await quotaDocumentsService.update(
        currentDocument.id,
        "REJECTED",
        "Documento reprovado pelo administrador",
        currentDocument.user_data_id
      );

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Documento reprovado com sucesso", "success");
        await fetchDocuments(pagination.currentPage, pagination.itemsPerPage, "pending");
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
  }, [currentDocument, fetchDocuments, pagination, showSnackbar]);

  const fetchDocumentById = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await quotaDocumentsService.getById(id);

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
    currentDocument,
    allDocuments,
    pagination,
    snackbar,
    closeSnackbar,
    approveCurrent,
    recuseCurrent,
    next,
    prev,
    fetchDocuments,
    fetchAllDocuments,
    fetchDocumentById,
  };
};
