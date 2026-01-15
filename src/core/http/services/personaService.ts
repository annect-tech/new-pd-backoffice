import { httpClient } from "../httpClient";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface Persona {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PersonaPayload {
  name: string;
  description?: string;
  active?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const personaService = {
  /**
   * Lista todas as personas (admin)
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   */
  list: (page: number = 1, size: number = 10) => {
    return httpClient.get<PaginatedResponse<Persona>>(
      API_URL,
      "/admin/persona",
      {
        queryParams: {
          page,
          size,
        },
      }
    );
  },

  /**
   * Obtém uma persona específica por ID (admin)
   * @param id - ID da persona
   */
  getById: (id: string | number) =>
    httpClient.get<Persona>(
      API_URL,
      `/admin/persona/${id}`
    ),

  /**
   * Atualiza uma persona existente (admin)
   * @param id - ID da persona
   * @param payload - Dados atualizados
   */
  update: (id: string | number, payload: Partial<PersonaPayload>) =>
    httpClient.put<{ message: string }>(
      API_URL,
      "/admin/persona",
      id,
      payload
    ),

  /**
   * Deleta uma persona (admin)
   * @param id - ID da persona
   */
  delete: (id: string | number) =>
    httpClient.delete<{ message: string }>(
      API_URL,
      "/admin/persona",
      id
    ),

  // ========== USER ENDPOINTS ==========

  /**
   * Lista personas disponíveis (user)
   */
  listUser: (page: number = 1, size: number = 10) => {
    return httpClient.get<PaginatedResponse<Persona>>(
      API_URL,
      "/user/persona",
      {
        queryParams: {
          page,
          size,
        },
      }
    );
  },

  /**
   * Obtém uma persona específica (user)
   * @param id - ID da persona
   */
  getUserById: (id: string | number) =>
    httpClient.get<Persona>(
      API_URL,
      `/user/persona/${id}`
    ),

  /**
   * Cria uma nova persona (user)
   * @param payload - Dados da persona
   */
  createUser: (payload: PersonaPayload) =>
    httpClient.post<{ id: string; message: string }>(
      API_URL,
      "/user/persona",
      payload
    ),

  /**
   * Atualiza uma persona do usuário logado (user)
   * @param id - ID da persona
   * @param payload - Dados atualizados
   */
  updateUser: (id: string | number, payload: Partial<PersonaPayload>) =>
    httpClient.put<{ message: string }>(
      API_URL,
      "/user/persona",
      id,
      payload
    ),

  /**
   * Deleta uma persona do usuário logado (user)
   * @param id - ID da persona
   */
  deleteUser: (id: string | number) =>
    httpClient.delete<{ message: string }>(
      API_URL,
      "/user/persona",
      id
    ),
};
