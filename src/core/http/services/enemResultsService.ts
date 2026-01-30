import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";
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
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<EnemResult>>(
      API_URL,
      `/${prefix}/enem-results`,
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
  getById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<EnemResult>(
      API_URL,
      `/${prefix}/enem-results/${id}`
    );
  },

  /**
   * Atualiza o status de um resultado ENEM
   * @param id - ID do resultado
   * @param status - Novo status
   */
  updateStatus: (id: string | number, status: string) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<{ message: string }>(
      API_URL,
      `/${prefix}/enem-results`,
      id,
      { status }
    );
  },

  /**
   * Cria um novo resultado ENEM
   * @param payload - Dados do resultado (precisa de user_id)
   */
  create: (payload: { user_id: number }) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<{ id: string; message: string; languages_score: number; math_score: number; natural_sciences_score: number; human_sciences_score: number; essay_score: number }>(
      API_URL,
      `/${prefix}/enem-results`,
      payload
    );
  },

  /**
   * Deleta um resultado ENEM
   * @param id - ID do resultado
   */
  delete: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.delete<{ message: string }>(
      API_URL,
      `/${prefix}/enem-results`,
      id
    );
  },
};
