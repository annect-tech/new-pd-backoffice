import { httpClient } from "../httpClient";
import type { Address } from "../../../interfaces/userProfile";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface AddressPayload {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  localidade: string;
  uf: string;
  user_data_id?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const addressesService = {
  /**
   * Lista todos os endereços com paginação (admin)
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    return httpClient.get<PaginatedResponse<Address>>(
      API_URL,
      "/admin/addresses",
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
   * Obtém um endereço específico por ID (admin)
   * @param id - ID do endereço
   */
  getById: (id: string | number) =>
    httpClient.get<Address>(
      API_URL,
      `/admin/addresses/${id}`
    ),

  /**
   * Cria um novo endereço (admin)
   * @param payload - Dados do endereço
   */
  create: (payload: AddressPayload) =>
    httpClient.post<{ id: number; message: string }>(
      API_URL,
      "/admin/addresses",
      payload
    ),

  /**
   * Atualiza um endereço existente (admin)
   * @param id - ID do endereço
   * @param payload - Dados atualizados
   */
  update: (id: string | number, payload: Partial<AddressPayload>) =>
    httpClient.patch<{ message: string }>(
      API_URL,
      "/admin/addresses",
      id,
      payload
    ),

  /**
   * Deleta um endereço (admin)
   * @param id - ID do endereço
   */
  delete: (id: string | number) =>
    httpClient.delete<{ message: string }>(
      API_URL,
      "/admin/addresses",
      id
    ),

  // ========== USER ENDPOINTS ==========

  /**
   * Lista endereços do usuário logado (user)
   */
  listUser: (page: number = 1, size: number = 10, search?: string) => {
    return httpClient.get<PaginatedResponse<Address>>(
      API_URL,
      "/user/addresses",
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
   * Obtém um endereço específico do usuário logado (user)
   * @param id - ID do endereço
   */
  getUserById: (id: string | number) =>
    httpClient.get<Address>(
      API_URL,
      `/user/addresses/${id}`
    ),

  /**
   * Cria um novo endereço para o usuário logado (user)
   * @param payload - Dados do endereço
   */
  createUser: (payload: AddressPayload) =>
    httpClient.post<{ id: number; message: string }>(
      API_URL,
      "/user/addresses",
      payload
    ),

  /**
   * Atualiza um endereço do usuário logado (user)
   * @param id - ID do endereço
   * @param payload - Dados atualizados
   */
  updateUser: (id: string | number, payload: Partial<AddressPayload>) =>
    httpClient.patch<{ message: string }>(
      API_URL,
      "/user/addresses",
      id,
      payload
    ),

  /**
   * Deleta um endereço do usuário logado (user)
   * @param id - ID do endereço
   */
  deleteUser: (id: string | number) =>
    httpClient.delete<{ message: string }>(
      API_URL,
      "/user/addresses",
      id
    ),
};
