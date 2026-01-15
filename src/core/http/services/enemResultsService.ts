import { httpClient } from "../httpClient";
import type { EnemResult } from "../../../interfaces/enemResult";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const enemResultsService = {
  /**
   * Lista todos os resultados do ENEM com paginação
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    return httpClient.get<PaginatedResponse<EnemResult>>(
      API_URL,
      "/admin/enem-results",
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
   * Obtém detalhes de um resultado específico
   * @param id - ID do resultado ENEM
   */
  getById: (id: string | number) =>
    httpClient.get<EnemResult>(
      API_URL,
      `/admin/enem-results/${id}`
    ),

  /**
   * Atualiza o status de um resultado ENEM
   * @param id - ID do resultado
   * @param status - Novo status
   */
  updateStatus: (id: string | number, status: string) =>
    httpClient.patch<{ message: string }>(
      API_URL,
      "/admin/enem-results",
      id,
      { status }
    ),

  /**
   * Cria um novo resultado ENEM
   * @param payload - Dados do resultado
   */
  create: (payload: Partial<EnemResult>) =>
    httpClient.post<{ id: string; message: string }>(
      API_URL,
      "/admin/enem-results",
      payload
    ),

  /**
   * Deleta um resultado ENEM
   * @param id - ID do resultado
   */
  delete: (id: string | number) =>
    httpClient.delete<{ message: string }>(
      API_URL,
      "/admin/enem-results",
      id
    ),
};
