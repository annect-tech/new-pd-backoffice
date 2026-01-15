import { httpClient } from "../httpClient";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface Contract {
  id: number;
  status: string;
  user_data: {
    cpf: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const contractsService = {
  /**
   * Lista todos os contratos com paginação
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    return httpClient.get<PaginatedResponse<Contract>>(
      API_URL,
      "/admin/contract",
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
   * Obtém detalhes de um contrato específico
   * @param id - ID do contrato
   */
  getById: (id: string | number) =>
    httpClient.get<Contract>(
      API_URL,
      `/admin/contract/${id}`
    ),

  /**
   * Atualiza o status de um contrato
   * @param id - ID do contrato
   * @param status - Novo status
   */
  updateStatus: (id: string | number, status: string) =>
    httpClient.patch<{ message: string }>(
      API_URL,
      "/admin/contract",
      id,
      { status }
    ),

  /**
   * Cria um novo contrato
   * @param payload - Dados do contrato
   */
  create: (payload: Partial<Contract>) =>
    httpClient.post<{ id: string; message: string }>(
      API_URL,
      "/admin/contract",
      payload
    ),

  /**
   * Deleta um contrato
   * @param id - ID do contrato
   */
  delete: (id: string | number) =>
    httpClient.delete<{ message: string }>(
      API_URL,
      "/admin/contract",
      id
    ),
};
