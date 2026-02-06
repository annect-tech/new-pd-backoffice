import { httpClient } from "../httpClient";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface SelectionProcess {
  id: string;
  name: string;
  tenant_city_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface SelectionProcessActionResponse {
  id: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

const prefix = "admin";

export const selectionProcessService = {
  /**
   * Lista todos os processos seletivos com paginação
   * @param page
   * @param size
   */
  findAll: (page: number = 1, size: number = 50) => {
    // Seguindo o padrão de nomenclatura: admin/selection-processes
    return httpClient.get<PaginatedResponse<SelectionProcess>>(
      API_URL,
      `/${prefix}/processes`,
      {
        queryParams: {
          page,
          size,
        },
      }
    );
  },

  /**
   * Obtém detalhes de um processo seletivo específico
   * @param id - UUID do processo
   */
  findById: (id: string | number) => {
    return httpClient.get<SelectionProcess>(
      API_URL,
      `/${prefix}/processes/${id}`
    );
  },

  /**
   * Ativa um processo seletivo (torna-o o ativo da cidade sede)
   * @param id - UUID do processo
   */
  activate: (id: string | number) => {
    return httpClient.customPatch<{ message: string }>(
      API_URL,
      `/${prefix}/processes/${id}/activate`
    );
  },

  /**
   * Cria um novo processo seletivo
   * @param data - Objeto contendo name e tenant_city_id
   */
  create: (data: { name: string; tenant_city_id: string }) => {
    return httpClient.post<SelectionProcessActionResponse>(
      API_URL,
      `/${prefix}/processes`,
      data
    );
  },

  /**
   * Atualiza um processo seletivo existente
   * @param id - UUID do processo
   * @param data - Dados para atualização
   */
  update: (id: string | number, data: { name?: string; tenant_city_id?: string }) => {
    return httpClient.patch<SelectionProcessActionResponse>(
      API_URL,
      `/${prefix}/processes`,
      id, // O ID é passado como identificador no padrão do seu httpClient
      data
    );
  },

  /**
   * Deleta um processo seletivo
   * @param id - UUID do processo
   */
  delete: (id: string | number) => {
    return httpClient.delete<{ message: string }>(
      API_URL,
      `/${prefix}/selection-processes`,
      id
    );
  },
};