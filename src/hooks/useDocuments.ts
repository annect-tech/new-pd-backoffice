import { useCallback, useState } from "react";
import {
    candidateDocumentsService,
    type CandidateDocument,
} from "../core/http/services/candidateDocumentsService";

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

export const useDocuments = () => {
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [currentDocuments, setCurrentDocuments] = useState<CandidateDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  /**
   * Lista documentos de candidatos (admin)
   */
  const fetchDocuments = useCallback(
    async (page: number = 1, size: number = 10) => {
      setLoading(true);
      try {
        const response = await candidateDocumentsService.list(page, size);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const docData = Array.isArray(response.data.data) ? response.data.data : [];
          setDocuments(docData);
          setPagination({
            currentPage: response.data.currentPage || page,
            itemsPerPage: response.data.itemsPerPage || size,
            totalItems: response.data.totalItems || 0,
            totalPages: response.data.totalPages || 0,
          });
          showSnackbar("Dados carregados com sucesso", "success");
        } else {
          setDocuments([]);
          showSnackbar(
            response.message || "Erro ao buscar documentos",
            "error"
          );
        }
      } catch (error: any) {
        setDocuments([]);
        showSnackbar(error?.message || "Erro ao buscar documentos", "error");
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Lista documentos do usuário logado (user)
   */
  const fetchUserDocuments = useCallback(
    async (page: number = 1, size: number = 10) => {
      setLoading(true);
      try {
        const response = await candidateDocumentsService.listUser(page, size);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const docData = Array.isArray(response.data.data) ? response.data.data : [];
          setDocuments(docData);
          setPagination({
            currentPage: response.data.currentPage || page,
            itemsPerPage: response.data.itemsPerPage || size,
            totalItems: response.data.totalItems || 0,
            totalPages: response.data.totalPages || 0,
          });
        } else {
          setDocuments([]);
          showSnackbar(
            response.message || "Erro ao buscar documentos",
            "error"
          );
        }
      } catch (error: any) {
        setDocuments([]);
        showSnackbar(error?.message || "Erro ao buscar documentos", "error");
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Obtém documentos por userDataId (admin)
   */
  const fetchDocumentsByUserDataId = useCallback(
    async (userDataId: string | number) => {
      setLoading(true);
      try {
        const response = await candidateDocumentsService.getByUserDataId(userDataId);

        if (response.status >= 200 && response.status < 300 && response.data) {
          const docs = Array.isArray(response.data)
            ? response.data
            : [response.data as CandidateDocument];
          setCurrentDocuments(docs);
          return docs;
        } else {
          showSnackbar(
            response.message || "Erro ao buscar documentos",
            "error"
          );
          return [];
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao buscar documentos", "error");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  /**
   * Faz upload de documento (admin)
   */
  const uploadDocument = useCallback(
    async (file: File, userDataId: string | number, documentType: string) => {
      setUploading(true);
      try {
        const response = await candidateDocumentsService.upload(
          file,
          userDataId,
          documentType
        );

        if (response.status >= 200 && response.status < 300 && response.data) {
          showSnackbar("Documento enviado com sucesso!", "success");
          await fetchDocuments(pagination.currentPage, pagination.itemsPerPage);
          return response.data.url;
        } else {
          showSnackbar(
            response.message || "Erro ao fazer upload do documento",
            "error"
          );
          return null;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao fazer upload do documento", "error");
        return null;
      } finally {
        setUploading(false);
      }
    },
    [showSnackbar, fetchDocuments, pagination]
  );

  /**
   * Faz upload de documento de identidade (admin)
   */
  const uploadId = useCallback(
    async (userDataId: string | number, _fileName: string, file: File) => {
      return uploadDocument(file, userDataId, "id_doc");
    },
    [uploadDocument]
  );

  /**
   * Faz upload de documento de endereço (admin)
   */
  const uploadAddress = useCallback(
    async (userDataId: string | number, _fileName: string, file: File) => {
      return uploadDocument(file, userDataId, "address_doc");
    },
    [uploadDocument]
  );

  /**
   * Faz upload de histórico escolar (admin)
   */
  const uploadSchoolHistory = useCallback(
    async (userDataId: string | number, _fileName: string, file: File) => {
      return uploadDocument(file, userDataId, "school_history_doc");
    },
    [uploadDocument]
  );

  /**
   * Faz upload de documento do usuário logado (user)
   */
  const uploadUserDocument = useCallback(
    async (file: File, userDataId: string | number, documentType: string) => {
      setUploading(true);
      try {
        const response = await candidateDocumentsService.uploadUser(
          file,
          userDataId,
          documentType
        );

        if (response.status >= 200 && response.status < 300 && response.data) {
          showSnackbar("Documento enviado com sucesso!", "success");
          await fetchUserDocuments();
          return response.data.url;
        } else {
          showSnackbar(
            response.message || "Erro ao fazer upload do documento",
            "error"
          );
          return null;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao fazer upload do documento", "error");
        return null;
      } finally {
        setUploading(false);
      }
    },
    [showSnackbar, fetchUserDocuments]
  );

  /**
   * Atualiza um documento (admin)
   */
  const updateDocument = useCallback(
    async (
      userDataId: string | number,
      payload: {
        id_doc_status?: string;
        id_doc?: string;
        id_doc_refuse_reason?: string;
        address_doc_status?: string;
        address_doc?: string;
        address_doc_refuse_reason?: string;
        school_history_doc_status?: string;
        school_history_doc?: string;
        school_history_doc_refuse_reason?: string;
        contract_doc_status?: string;
        contract_doc?: string;
        contract_doc_refuse_reason?: string;
      }
    ) => {
      try {
        const response = await candidateDocumentsService.update(userDataId, payload);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Documento atualizado com sucesso!", "success");
          await fetchDocuments(pagination.currentPage, pagination.itemsPerPage);
          return true;
        } else {
          const errorMessage = response.message || "Erro ao atualizar documento";

          // Verificar se é erro de cidade sede - nesse caso a operação principal pode ter sido bem-sucedida
          const isTenantCityError = errorMessage.toLowerCase().includes("cidade sede") ||
                                     errorMessage.toLowerCase().includes("no tag") ||
                                     errorMessage.toLowerCase().includes("no domain");

          if (isTenantCityError) {
            // Recarregar a lista para verificar se o status foi atualizado
            await fetchDocuments(pagination.currentPage, pagination.itemsPerPage);
            showSnackbar("Documento atualizado, mas há um problema de configuração de Cidade Sede (verifique domain/tag)", "warning");
            return true; // Retorna true pois a operação principal foi bem-sucedida
          } else {
            showSnackbar(errorMessage, "error");
            return false;
          }
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao atualizar documento", "error");
        return false;
      }
    },
    [showSnackbar, fetchDocuments, pagination]
  );

  /**
   * Deleta um documento (admin)
   */
  const deleteDocument = useCallback(
    async (userDataId: string | number) => {
      try {
        const response = await candidateDocumentsService.delete(userDataId);

        if (response.status >= 200 && response.status < 300) {
          showSnackbar("Documento deletado com sucesso!", "success");
          await fetchDocuments(pagination.currentPage, pagination.itemsPerPage);
          return true;
        } else {
          showSnackbar(
            response.message || "Erro ao deletar documento",
            "error"
          );
          return false;
        }
      } catch (error: any) {
        showSnackbar(error?.message || "Erro ao deletar documento", "error");
        return false;
      }
    },
    [showSnackbar, fetchDocuments, pagination]
  );

  return {
    documents,
    currentDocuments,
    loading,
    uploading,
    pagination,
    snackbar,
    closeSnackbar,
    fetchDocuments,
    fetchUserDocuments,
    fetchDocumentsByUserDataId,
    uploadDocument,
    uploadUserDocument,
    uploadId,
    uploadAddress,
    uploadSchoolHistory,
    updateDocument,
    deleteDocument,
  };
};
