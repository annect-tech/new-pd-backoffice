import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";
import type { AcademicMerit } from "../../../interfaces/academicMerit";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const academicMeritService = {
  /**
   * Lista todos os documentos de mérito acadêmico com paginação
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param status - Filtro por status (pending, aprovado, reprovado)
   */
  list: (page: number = 1, size: number = 10, status?: string) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<AcademicMerit>>(
      API_URL,
      `/${prefix}/academic-merit-documents`,
      {
        queryParams: {
          page,
          size,
          ...(status ? { status } : {}),
        },
      }
    );
  },

  /**
   * Lista apenas documentos pendentes (para revisão)
   */
  listPending: () => {
    const prefix = getEndpointPrefix();
    return httpClient.get<AcademicMerit[]>(
      API_URL,
      `/${prefix}/academic-merit-documents/pending`
    );
  },

  /**
   * Lista todos os documentos (para histórico)
   * Usa o endpoint list sem filtro de status para retornar todos
   */
  listAll: () => {
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<AcademicMerit>>(
      API_URL,
      `/${prefix}/academic-merit-documents?page=1&size=1000`
    );
  },

  /**
   * Obtém detalhes de um documento específico
   * @param id - ID do documento
   */
  getById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<AcademicMerit>(
      API_URL,
      `/${prefix}/academic-merit-documents/${id}`
    );
  },

  /**
   * Aprova um documento de mérito acadêmico (atualiza status para APPROVED)
   * @param id - ID do documento
   * @param user_data_id - ID do user_data (opcional, mas pode ser necessário)
   */
  approve: (id: string | number, user_data_id?: string) => {
    const prefix = getEndpointPrefix();
    return httpClient.put<AcademicMerit>(
      API_URL,
      `/${prefix}/academic-merit-documents`,
      id,
      { 
        status: "APPROVED",
        ...(user_data_id && { user_data_id })
      }
    );
  },

  /**
   * Reprova um documento de mérito acadêmico (atualiza status para REJECTED)
   * @param id - ID do documento
   * @param user_data_id - ID do user_data (opcional, mas pode ser necessário)
   */
  reject: (id: string | number, user_data_id?: string) => {
    const prefix = getEndpointPrefix();
    return httpClient.put<AcademicMerit>(
      API_URL,
      `/${prefix}/academic-merit-documents`,
      id,
      { 
        status: "REJECTED",
        ...(user_data_id && { user_data_id })
      }
    );
  },

  /**
   * Deleta um documento de mérito acadêmico
   * @param id - ID do documento
   */
  delete: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.delete<{ message: string }>(
      API_URL,
      `/${prefix}/academic-merit-documents`,
      id
    );
  },
};
