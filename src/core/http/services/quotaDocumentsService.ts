import { httpClient } from "../httpClient";
import type { QuotaDocument } from "../../../interfaces/quotaDocument";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const quotaDocumentsService = {
  /**
   * Lista todos os documentos de cotas com paginação
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca (opcional)
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    return httpClient.get<PaginatedResponse<QuotaDocument>>(
      API_URL,
      `/admin/candidate-quotas`,
      {
        queryParams: {
          page,
          size,
          ...(search ? { search } : {}),
        },
      }
    );
  },

  /**
   * Obtém detalhes de um documento específico
   * @param id - ID do documento
   */
  getById: (id: string) => {
    return httpClient.get<QuotaDocument>(
      API_URL,
      `/admin/candidate-quotas/${id}`
    );
  },

  /**
   * Atualiza o status de um documento de cotas
   * @param id - ID do documento
   * @param quota_doc_status - Status do documento (APPROVED, REJECTED, PENDING)
   * @param quota_doc_refuse_reason - Motivo da recusa (opcional)
   * @param user_data_id - ID do user_data (opcional)
   */
  update: (
    id: string,
    quota_doc_status?: string,
    quota_doc_refuse_reason?: string,
    user_data_id?: string
  ) => {
    return httpClient.patch<{ message: string }>(
      API_URL,
      `/admin/candidate-quotas`,
      id,
      {
        ...(quota_doc_status && { quota_doc_status }),
        ...(quota_doc_refuse_reason && { quota_doc_refuse_reason }),
        ...(user_data_id && { user_data_id }),
      }
    );
  },

  /**
   * Cria uma cota e faz upload do documento
   * @param user_id - ID do usuário
   * @param user_data_id - ID do user_data
   * @param file - Arquivo PDF do documento
   */
  create: (user_id: string, user_data_id: string, file: File) => {
    return httpClient.uploadFile<{ id: string; url: string; message: string }>(
      API_URL,
      `/admin/candidate-quotas`,
      file,
      {
        user_id,
        user_data_id,
      }
    );
  },
};
