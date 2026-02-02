import { useState, useCallback, useMemo } from "react";
import { candidateDocumentsService } from "../core/http/services/candidateDocumentsService";
import type { CandidateDocument } from "../core/http/services/candidateDocumentsService";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export const useContractDocuments = () => {
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
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

  /**
   * Busca documentos de contrato pendentes de aprovação
   */
  const fetchPendingContracts = useCallback(async (page: number = 1, size: number = 100) => {
    setLoading(true);
    setError(null);
    try {
      const response = await candidateDocumentsService.list(page, size);

      console.log("Response from candidateDocumentsService.list:", response);

      if (response.status >= 200 && response.status < 300 && response.data) {
        const raw = response.data as any;
        let list: CandidateDocument[] = [];

        if (Array.isArray(raw)) {
          list = raw;
        } else if (Array.isArray(raw?.data)) {
          list = raw.data;
        }

        // Filtrar apenas os que têm status "pending" (aguardando aprovação)
        list = list.filter((doc: CandidateDocument) => {
          const status = doc.contract_doc_status?.toLowerCase() || "";
          return status === "pending";
        });

        setDocuments(list);
        setCurrentIndex(0);
        if (list.length > 0) {
          showSnackbar("Dados carregados com sucesso", "success");
        }
      } else {
        setDocuments([]);
        const errorMessage = response.message || "Erro ao carregar documentos";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      }
    } catch (err: any) {
      setDocuments([]);
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

  /**
   * Aprova o contrato atual
   */
  const approveCurrent = useCallback(async () => {
    if (!currentDocument) return;

    setActionLoading(true);
    try {
      const response = await candidateDocumentsService.update(
        currentDocument.user_data_id,
        { contract_doc_status: "approved" }
      );

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Contrato aprovado com sucesso", "success");
        // Refresh list
        await fetchPendingContracts();
      } else {
        const errorMessage = response.message || "Erro ao aprovar contrato";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao aprovar contrato";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setActionLoading(false);
    }
  }, [currentDocument, fetchPendingContracts, showSnackbar]);

  /**
   * Rejeita o contrato atual
   */
  const rejectCurrent = useCallback(async (reason?: string) => {
    if (!currentDocument) return;

    setActionLoading(true);
    try {
      const payload: { contract_doc_status: string; contract_doc_refuse_reason?: string } = {
        contract_doc_status: "refused",
      };

      if (reason) {
        payload.contract_doc_refuse_reason = reason;
      }

      console.log("Reject payload:", payload, "userDataId:", currentDocument.user_data_id);

      const response = await candidateDocumentsService.update(
        currentDocument.user_data_id,
        payload
      );

      console.log("Reject response:", response);

      if (response.status >= 200 && response.status < 300) {
        showSnackbar("Contrato rejeitado com sucesso", "success");
        // Refresh list
        await fetchPendingContracts();
      } else {
        const errorMessage = response.message || "Erro ao rejeitar contrato";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao rejeitar contrato";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setActionLoading(false);
    }
  }, [currentDocument, fetchPendingContracts, showSnackbar]);

  return {
    loading,
    error,
    actionLoading,
    count,
    currentIndex,
    currentDocument,
    documents,
    snackbar,
    closeSnackbar,
    approveCurrent,
    rejectCurrent,
    next,
    prev,
    fetchPendingContracts,
  };
};
