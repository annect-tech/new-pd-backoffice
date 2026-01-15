import { httpClient } from "../httpClient";
import type { Guardian } from "../../../interfaces/userProfile";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface GuardianPayload {
  cpf: string;
  relationship: string;
  name: string;
  cellphone: string;
  email: string;
  user_data_id?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const guardiansService = {
  /**
   * Lista todos os responsáveis com paginação (admin)
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    return httpClient.get<PaginatedResponse<Guardian>>(
      API_URL,
      "/admin/guardians",
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
   * Cria um novo responsável (admin)
   * @param payload - Dados do responsável
   */
  create: (payload: GuardianPayload) =>
    httpClient.post<{ id: string; message: string }>(
      API_URL,
      "/admin/guardians",
      payload
    ),

  /**
   * Atualiza um responsável existente (admin)
   * @param id - ID do responsável
   * @param payload - Dados atualizados
   */
  update: (id: string | number, payload: Partial<GuardianPayload>) =>
    httpClient.patch<{ message: string }>(
      API_URL,
      "/admin/guardians",
      id,
      payload
    ),

  /**
   * Deleta um responsável (admin)
   * @param id - ID do responsável
   */
  delete: (id: string | number) =>
    httpClient.delete<{ message: string }>(
      API_URL,
      "/admin/guardians",
      id
    ),
};
