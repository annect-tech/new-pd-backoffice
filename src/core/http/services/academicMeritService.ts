import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";
import type { AcademicMerit } from "../../../interfaces/academicMerit";
import { getApiUrl } from "../apiUrl";

const API_URL = getApiUrl();

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
    // Admin usa /admin/academic-merit, User usa /user/academic-merit-documents
    const endpoint = prefix === "admin" ? "academic-merit" : "academic-merit-documents";
    return httpClient.get<PaginatedResponse<AcademicMerit>>(
      API_URL,
      `/${prefix}/${endpoint}`,
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
   * Nota: Este endpoint não existe no Swagger, usando list com filtro
   */
  listPending: () => {
    const prefix = getEndpointPrefix();
    const endpoint = prefix === "admin" ? "academic-merit" : "academic-merit-documents";
    return httpClient.get<PaginatedResponse<AcademicMerit>>(
      API_URL,
      `/${prefix}/${endpoint}`,
      {
        queryParams: {
          page: 1,
          size: 1000,
          status: "PENDING",
        },
      }
    );
  },

  /**
   * Lista todos os documentos (para histórico)
   * Usa o endpoint list sem filtro de status para retornar todos
   */
  listAll: () => {
    const prefix = getEndpointPrefix();
    const endpoint = prefix === "admin" ? "academic-merit" : "academic-merit-documents";
    return httpClient.get<PaginatedResponse<AcademicMerit>>(
      API_URL,
      `/${prefix}/${endpoint}`,
      {
        queryParams: {
          page: 1,
          size: 1000,
        },
      }
    );
  },

  /**
   * Obtém detalhes de um documento específico
   * @param id - ID do documento
   */
  getById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    // Admin usa /admin/academic-merit/{id}, User usa /user/academic-merit-documents/{id}
    const endpoint = prefix === "admin" ? "academic-merit" : "academic-merit-documents";
    return httpClient.get<AcademicMerit>(
      API_URL,
      `/${prefix}/${endpoint}/${id}`
    );
  },

  /**
   * Aprova um documento de mérito acadêmico (atualiza status para APPROVED)
   * @param id - ID do documento
   */
  approve: (id: string | number) => {
    const prefix = getEndpointPrefix();
    const endpoint = prefix === "admin" ? "academic-merit" : "academic-merit-documents";
    return httpClient.put<AcademicMerit>(
      API_URL,
      `/${prefix}/${endpoint}`,
      id,
      { 
        status: "APPROVED"
      }
    );
  },

  /**
   * Reprova um documento de mérito acadêmico (atualiza status para REJECTED)
   * @param id - ID do documento
   */
  reject: (id: string | number) => {
    const prefix = getEndpointPrefix();
    const endpoint = prefix === "admin" ? "academic-merit" : "academic-merit-documents";
    return httpClient.put<AcademicMerit>(
      API_URL,
      `/${prefix}/${endpoint}`,
      id,
      { 
        status: "REJECTED"
      }
    );
  },

  /**
   * Atualiza o status de um documento de mérito acadêmico
   * @param id - ID do documento
   * @param status - Novo status (PENDING, APPROVED, REJECTED)
   */
  updateStatus: (id: string | number, status: "PENDING" | "APPROVED" | "REJECTED") => {
    const prefix = getEndpointPrefix();
    const endpoint = prefix === "admin" ? "academic-merit" : "academic-merit-documents";
    return httpClient.put<AcademicMerit>(
      API_URL,
      `/${prefix}/${endpoint}`,
      id,
      { 
        status
      }
    );
  },

  /**
   * Deleta um documento de mérito acadêmico
   * @param id - ID do documento
   */
  delete: (id: string | number) => {
    const prefix = getEndpointPrefix();
    const endpoint = prefix === "admin" ? "academic-merit" : "academic-merit-documents";
    return httpClient.delete<{ message: string }>(
      API_URL,
      `/${prefix}/${endpoint}`,
      id
    );
  },

  /**
   * Lista documentos com dados completos de usuário (inclui user_data_display)
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca (opcional)
   */
  listDetailed: (page: number = 1, size: number = 10, search?: string) => {
    const prefix = getEndpointPrefix();
    // Admin usa /admin/academic-merit/detailed, User usa /user/academic-merit-documents/detailed
    const endpoint = prefix === "admin" ? "academic-merit/detailed" : "academic-merit-documents/detailed";
    return httpClient.get<PaginatedResponse<AcademicMerit>>(
      API_URL,
      `/${prefix}/${endpoint}`,
      {
        queryParams: {
          page,
          size,
          ...(search ? { search } : {}),
        },
      }
    );
  },
};
