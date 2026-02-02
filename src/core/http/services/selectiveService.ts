import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";
import type { UserProfile } from "../../../interfaces/userProfile";
import { getApiUrl } from "../apiUrl";

const API_URL = getApiUrl();

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const selectiveService = {
  /**
   * Lista todos os candidatos do seletivo com paginação
   * Busca dados do auth_user (endpoint /user/users)
   * O backend deve retornar dados completos com relacionamentos (seletivo_userdata, endereços, etc)
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<UserProfile>>(
      API_URL,
      `/${prefix}/users`,
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
   * Obtém detalhes de um candidato específico do seletivo
   * Tenta buscar pelo endpoint /user/user-data que retorna dados completos
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
