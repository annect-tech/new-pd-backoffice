import { httpClient } from "../httpClient";
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
    return httpClient.get<PaginatedResponse<AcademicMerit>>(
      API_URL,
      "/admin/academic-merit-documents",
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
  listPending: () =>
    httpClient.get<AcademicMerit[]>(
      API_URL,
      "/admin/academic-merit-documents/pending"
    ),

  /**
   * Lista todos os documentos (para histórico)
   * Usa o endpoint list sem filtro de status para retornar todos
   */
  listAll: () =>
    httpClient.get<PaginatedResponse<AcademicMerit>>(
      API_URL,
      "/admin/academic-merit-documents?page=1&size=1000"
    ),

  /**
   * Obtém detalhes de um documento específico
   * @param id - ID do documento
   */
  getById: (id: string | number) =>
    httpClient.get<AcademicMerit>(
      API_URL,
      `/admin/academic-merit-documents/${id}`
    ),

  /**
   * Aprova um documento de mérito acadêmico
   * @param id - ID do documento
   */
  approve: (id: string | number) =>
    httpClient.post<{ message: string }>(
      API_URL,
      `/admin/academic-merit-documents/${id}/approve`,
      {}
    ),

  /**
   * Reprova um documento de mérito acadêmico
   * @param id - ID do documento
   */
  reject: (id: string | number) =>
    httpClient.post<{ message: string }>(
      API_URL,
      `/admin/academic-merit-documents/${id}/reject`,
      {}
    ),

  /**
   * Deleta um documento de mérito acadêmico
   * @param id - ID do documento
   */
  delete: (id: string | number) =>
    httpClient.delete<{ message: string }>(
      API_URL,
      "/admin/academic-merit-documents",
      id
    ),
};
