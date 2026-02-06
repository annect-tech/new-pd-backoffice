import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";
import type { Exam } from "../../../interfaces/exam";
import type { StudentExamStatus, PaginatedResponse } from "../../../interfaces/examScheduleTypes";
import { getApiUrl } from "../apiUrl";

const API_URL = getApiUrl();

export const examsService = {
  /**
   * Lista todos os alunos inscritos com paginação
   * GET /user/student-exams
   * 
   * @param page - Número da página (default: 1)
   * @param limit - Itens por página (default: 10)
   * @param search - Termo de busca (nome ou CPF)
   */
  list: (page: number = 1, limit: number = 10, search?: string) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<Exam>>(
      API_URL,
      `/${prefix}/student-exams`,
      {
        queryParams: {
          page,
          limit,
          ...(search ? { search } : {}),
        },
      }
    );
  },

  /**
   * Busca inscrição de aluno por ID
   * GET /user/student-exams/:id
   * 
   * @param id - ID do student exam
   */
  getById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<Exam>(
      API_URL,
      `/${prefix}/student-exams/${id}`
    );
  },

  /**
   * Atualiza o status de um aluno
   * PATCH /user/student-exams/:id
   * 
   * @param id - ID do student exam
   * @param status - Novo status (pendente, aprovado, ausente, desqualificado)
   */
  updateStatus: (id: string | number, status: StudentExamStatus) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<{ message: string }>(
      API_URL,
      `/${prefix}/student-exams`,
      id,
      { status }
    );
  },

  /**
   * Atualiza a nota de um aluno
   * PATCH /user/student-exams/:id
   * 
   * @param id - ID do student exam
   * @param score - Nova nota (0 a 999.99)
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
   * Reagenda o horário de um aluno
   * PATCH /user/student-exams/:id
   * 
   * @param id - ID do student exam
   * @param examScheduledHourId - ID do novo horário
   */
  reschedule: (id: string | number, examScheduledHourId: number) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<{ message: string }>(
      API_URL,
      `/${prefix}/student-exams`,
      id,
      { exam_scheduled_hour_id: examScheduledHourId }
    );
  },

  /**
   * Inscreve um aluno no processo seletivo
   * POST /user/student-exams
   * 
   * @param userDataId - ID do auth_user do aluno
   * @param examScheduledHourId - ID do horário agendado (opcional)
   */
  create: (userDataId: number, examScheduledHourId?: number | null) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<{ id: string; message: string }>(
      API_URL,
      `/${prefix}/student-exams`,
      {
        user_data_id: userDataId,
        ...(examScheduledHourId !== undefined ? { exam_scheduled_hour_id: examScheduledHourId } : {}),
      }
    );
  },

  /**
   * Remove inscrição de aluno
   * DELETE /user/student-exams/:id
   * 
   * @param id - ID do student exam
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
