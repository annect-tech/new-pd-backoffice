import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";
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
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<ExamScheduled>>(
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
   * Obtém detalhes de um exame agendado específico
   * @param id - ID do exame agendado
   */
  getById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<ExamScheduled>(
      API_URL,
      `/${prefix}/student-exams/${id}`
    );
  },

  /**
   * Mapeia status do frontend para o valor aceito pela API (português).
   * API aceita: pendente | aprovado | ausente | desqualificado
   */
  _mapStatusToApi(status: string): string {
    const map: Record<string, string> = {
      scheduled: "pendente",
      present: "aprovado",
      absent: "ausente",
      pendente: "pendente",
      aprovado: "aprovado",
      ausente: "ausente",
      desqualificado: "desqualificado",
    };
    return map[status.toLowerCase()] ?? status;
  },

  /**
   * Atualiza o status de um exame agendado
   * @param id - ID do exame agendado
   * @param status - Novo status (present, absent, scheduled ou pendente, aprovado, ausente)
   */
  updateStatus: (id: string | number, status: string) => {
    const prefix = getEndpointPrefix();
    const apiStatus = examsScheduledService._mapStatusToApi(status);
    return httpClient.patch<{ message: string }>(
      API_URL,
      `/${prefix}/student-exams`,
      id,
      { status: apiStatus }
    );
  },

  /**
   * Atualiza a nota de um exame agendado
   * @param id - ID do exame agendado
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

  /**
   * Cria um novo agendamento de exame
   * @param payload - Dados do agendamento
   */
  create: (payload: Partial<ExamScheduled>) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<{ id: string; message: string }>(
      API_URL,
      `/${prefix}/student-exams`,
      payload
    );
  },

  /**
   * Deleta um exame agendado
   * @param id - ID do exame agendado
   */
  delete: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.delete<{ message: string }>(
      API_URL,
      `/${prefix}/student-exams`,
      id
    );
  },
};
