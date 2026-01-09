import { httpClient } from "../httpClient";
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
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    return httpClient.get<PaginatedResponse<UserProfile>>(
      API_URL,
      `/admin/user-data?${params.toString()}`
    );
  },

  /**
   * Obtém detalhes de um usuário específico do seletivo
   * @param id - ID do usuário
   */
  getById: (id: string | number) =>
    httpClient.get<UserProfile>(
      API_URL,
      `/admin/user-data/${id}`
    ),

  /**
   * Atualiza dados de um usuário do seletivo
   * @param id - ID do usuário
   * @param payload - Dados atualizados
   */
  update: (id: string | number, payload: Partial<UserProfile>) =>
    httpClient.patch<{ message: string }>(
      API_URL,
      "/admin/user-data",
      id,
      payload
    ),

  /**
   * Aprova um usuário do seletivo
   * @param id - ID do usuário
   */
  approve: (id: string | number) =>
    httpClient.post<{ message: string }>(
      API_URL,
      `/admin/user-data/${id}/approve`,
      {}
    ),

  /**
   * Rejeita um usuário do seletivo
   * @param id - ID do usuário
   */
  reject: (id: string | number) =>
    httpClient.post<{ message: string }>(
      API_URL,
      `/admin/user-data/${id}/reject`,
      {}
    ),
};
