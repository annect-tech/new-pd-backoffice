import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";
import { getApiUrl } from "../apiUrl";

const API_URL = getApiUrl();

export interface Contract {
  id: string;
  status: string;
  user_data_id: string;
  student_name: string;
  student_email: string;
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
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<Contract>>(
      API_URL,
      `/${prefix}/contract`,
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
  getById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<Contract>(
      API_URL,
      `/${prefix}/contract/${id}`
    );
  },

  /**
   * Atualiza o status de um contrato
   * @param id - ID do contrato
   * @param status - Novo status
   */
  updateStatus: (id: string | number, status: string) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<{ message: string }>(
      API_URL,
      `/${prefix}/contract`,
      id,
      { status }
    );
  },

  /**
   * Cria um novo contrato
   * @param payload - Dados do contrato (precisa de user_data_id)
   */
  create: (payload: { user_data_id: number }) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<{ message: string }>(
      API_URL,
      `/${prefix}/contract`,
      payload
    );
  },

  /**
   * Deleta um contrato
   * @param id - ID do contrato
   */
  delete: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.delete<{ message: string }>(
      API_URL,
      `/${prefix}/contract`,
      id
    );
  },
};
