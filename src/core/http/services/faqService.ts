import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FAQPayload {
  question: string;
  answer: string;
  category?: string;
  order?: number;
  active?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const faqService = {
  /**
   * Lista todas as FAQs com paginação (admin)
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<FAQ>>(
      API_URL,
      `/${prefix}/faqs`,
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
   * Obtém uma FAQ específica por ID (admin)
   * @param id - ID da FAQ
   */
  getById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<FAQ>(
      API_URL,
      `/${prefix}/faqs/${id}`
    );
  },

  /**
   * Cria uma nova FAQ (admin)
   * @param payload - Dados da FAQ
   */
  create: (payload: FAQPayload) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<{ id: string; message: string }>(
      API_URL,
      `/${prefix}/faqs`,
      payload
    );
  },

  /**
   * Atualiza uma FAQ existente (admin)
   * @param id - ID da FAQ
   * @param payload - Dados atualizados
   */
  update: (id: string | number, payload: Partial<FAQPayload>) => {
    const prefix = getEndpointPrefix();
    return httpClient.put<{ message: string }>(
      API_URL,
      `/${prefix}/faqs`,
      id,
      payload
    );
  },

  /**
   * Deleta uma FAQ (admin)
   * @param id - ID da FAQ
   */
  delete: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.delete<{ message: string }>(
      API_URL,
      `/${prefix}/faqs`,
      id
    );
  },

  // ========== USER ENDPOINTS ==========

  /**
   * Lista FAQs públicas (user)
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   */
  listUser: (page: number = 1, size: number = 10) => {
    return httpClient.get<PaginatedResponse<FAQ>>(
      API_URL,
      "/user/faqs",
      {
        queryParams: {
          page,
          size,
        },
      }
    );
  },
};
