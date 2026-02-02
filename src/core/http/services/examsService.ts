import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";
import type { Exam } from "../../../interfaces/exam";
import { getApiUrl } from "../apiUrl";

const API_URL = getApiUrl();

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const examsService = {
  /**
   * Lista todos os exames com paginação
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    // A rota correta para listar registros de prova (student exams)
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<Exam>>(
      API_URL,
      `/${prefix}/student-exams`,
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
   * Obtém detalhes de um exame específico
   * @param id - ID do exame (student exam)
   */
  getById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<Exam>(
      API_URL,
      `/${prefix}/student-exams/${id}`
    );
  },

  /**
   * Atualiza o status de um exame
   * @param id - ID do exame (student exam)
   * @param status - Novo status
   */
  updateStatus: (id: string | number, status: string) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<{ message: string }>(
      API_URL,
      `/${prefix}/student-exams`,
      id,
      { status }
    );
  },

  /**
   * Atualiza a nota de um exame
   * @param id - ID do exame (student exam)
   * @param score - Nova nota
   */
  updateScore: (id: string | number, score: number) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<{ message: string }>(
      API_URL,
      `/${prefix}/student-exams`,
      id,
      { score }
    );
  },
};
