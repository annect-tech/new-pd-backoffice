import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";
import type { UserProfile } from "../../../interfaces/userProfile";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const selectiveService = {
  /**
   * Lista todos os usuários do seletivo com paginação
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<UserProfile>>(
      API_URL,
      `/${prefix}/user-data`,
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
   * Obtém detalhes de um usuário específico do seletivo
   * @param id - ID do usuário
   */
  getById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<UserProfile>(
      API_URL,
      `/${prefix}/user-data/${id}`
    );
  },

  /**
   * Atualiza dados de um usuário do seletivo
   * @param id - ID do usuário
   * @param payload - Dados atualizados
   */
  update: (id: string | number, payload: Partial<UserProfile>) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<{ message: string }>(
      API_URL,
      `/${prefix}/user-data`,
      id,
      payload
    );
  },

  /**
   * Aprova um usuário do seletivo
   * @param id - ID do usuário
   */
  approve: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<{ message: string }>(
      API_URL,
      `/${prefix}/user-data/${id}/approve`,
      {}
    );
  },

  /**
   * Rejeita um usuário do seletivo
   * @param id - ID do usuário
   */
  reject: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<{ message: string }>(
      API_URL,
      `/${prefix}/user-data/${id}/reject`,
      {}
    );
  },
};
