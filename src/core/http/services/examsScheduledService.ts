import { httpClient } from "../httpClient";
import type { ExamScheduled } from "../../../interfaces/examScheduled";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const examsScheduledService = {
  /**
   * Lista todos os exames agendados com paginação
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    return httpClient.get<PaginatedResponse<ExamScheduled>>(
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
   * Obtém detalhes de um exame agendado específico
   * @param id - ID do exame agendado
   */
  getById: (id: string | number) =>
    httpClient.get<ExamScheduled>(
      API_URL,
      `/admin/student-exams/${id}`
    ),

  /**
   * Atualiza o status de um exame agendado
   * @param id - ID do exame agendado
   * @param status - Novo status (present, absent, scheduled)
   */
  updateStatus: (id: string | number, status: string) =>
    httpClient.patch<{ message: string }>(
      API_URL,
      "/admin/student-exams",
      id,
      { status }
    ),

  /**
   * Atualiza a nota de um exame agendado
   * @param id - ID do exame agendado
   * @param score - Nova nota
   */
  updateScore: (id: string | number, score: number) =>
    httpClient.patch<{ message: string }>(
      API_URL,
      "/admin/student-exams",
      id,
      { score }
    ),

  /**
   * Cria um novo agendamento de exame
   * @param payload - Dados do agendamento
   */
  create: (payload: Partial<ExamScheduled>) =>
    httpClient.post<{ id: string; message: string }>(
      API_URL,
      "/admin/student-exams",
      payload
    ),

  /**
   * Deleta um exame agendado
   * @param id - ID do exame agendado
   */
  delete: (id: string | number) =>
    httpClient.delete<{ message: string }>(
      API_URL,
      "/admin/student-exams",
      id
    ),
};
