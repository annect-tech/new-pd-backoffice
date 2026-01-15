import { httpClient } from "../httpClient";
import type { Exam } from "../../../interfaces/exam";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

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
    return httpClient.get<PaginatedResponse<Exam>>(
      API_URL,
      "/admin/student-exams",
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
   * @param id - ID do exame
   */
  getById: (id: string | number) =>
    httpClient.get<Exam>(
      API_URL,
      `/admin/exam/${id}`
    ),

  /**
   * Atualiza o status de um exame
   * @param id - ID do exame
   * @param status - Novo status
   */
  updateStatus: (id: string | number, status: string) =>
    httpClient.patch<{ message: string }>(
      API_URL,
      "/admin/exam",
      id,
      { status }
    ),

  /**
   * Atualiza a nota de um exame
   * @param id - ID do exame
   * @param score - Nova nota
   */
  updateScore: (id: string | number, score: number) =>
    httpClient.patch<{ message: string }>(
      API_URL,
      "/admin/exam",
      id,
      { score }
    ),
};
