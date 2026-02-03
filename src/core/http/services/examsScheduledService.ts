import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";
import { getApiUrl } from "../apiUrl";
import type {
  StudentExam,
  StudentExamPayload,
  StudentExamStatus,
  ScheduleGridResponse,
  PaginatedResponse,
} from "../../../interfaces/examScheduleTypes";

const API_URL = getApiUrl();

export const examsScheduledService = {
  // ============== STUDENT EXAMS ==============
  // Base URL: /user/student-exams

  /**
   * Inscreve um aluno no processo seletivo
   * POST /user/student-exams
   */
  create: (payload: StudentExamPayload) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<{ id: string; message: string }>(
      API_URL,
      `/${prefix}/student-exams`,
      payload
    );
  },

  /**
   * Lista todos os alunos inscritos (paginado)
   * GET /user/student-exams
   */
  list: (page: number = 1, limit: number = 10, search?: string) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<StudentExam>>(
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
   */
  getById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<StudentExam>(
      API_URL,
      `/${prefix}/student-exams/${id}`
    );
  },

  /**
   * Lista alunos por horário (visualização de grade)
   * GET /user/student-exams/schedule/:localId/:dateId
   * 
   * Retorna os alunos agrupados por horário para um local e data específicos.
   */
  getScheduleGrid: (localId: string | number, dateId: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<ScheduleGridResponse>(
      API_URL,
      `/${prefix}/student-exams/schedule/${localId}/${dateId}`
    );
  },

  /**
   * Atualiza dados da prova do aluno
   * PATCH /user/student-exams/:id
   * 
   * Permite atualizar nota, status ou reagendar o horário.
   */
  update: (id: string | number, payload: Partial<StudentExamPayload>) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<{ message: string }>(
      API_URL,
      `/${prefix}/student-exams`,
      id,
      payload
    );
  },

  /**
   * Atualiza o status de um aluno
   * PATCH /user/student-exams/:id
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
   * Remove inscrição de aluno
   * DELETE /user/student-exams/:id
   */
  delete: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.delete<{ message: string }>(
      API_URL,
      `/${prefix}/student-exams`,
      id
    );
  },

  // ============== HELPERS ==============

  /**
   * Mapeia status do frontend para o valor aceito pela API
   * API aceita: pendente | aprovado | ausente | desqualificado
   */
  mapStatusToAPI: (status: string): StudentExamStatus => {
    const map: Record<string, StudentExamStatus> = {
      scheduled: "pendente",
      agendado: "pendente",
      pendente: "pendente",
      present: "aprovado",
      presente: "aprovado",
      aprovado: "aprovado",
      absent: "ausente",
      ausente: "ausente",
      desqualificado: "desqualificado",
    };
    return map[status.toLowerCase()] ?? "pendente";
  },

  /**
   * Mapeia status da API para o frontend
   */
  mapStatusFromAPI: (status: string): string => {
    const map: Record<string, string> = {
      pendente: "scheduled",
      aprovado: "present",
      ausente: "absent",
      desqualificado: "desqualificado",
    };
    return map[status.toLowerCase()] ?? status;
  },

  /**
   * Labels para exibição dos status
   */
  getStatusLabel: (status: StudentExamStatus): string => {
    const labels: Record<StudentExamStatus, string> = {
      pendente: "Pendente",
      aprovado: "Aprovado",
      ausente: "Ausente",
      desqualificado: "Desqualificado",
    };
    return labels[status] ?? status;
  },

  /**
   * Cores para os status
   */
  getStatusColor: (status: StudentExamStatus): "warning" | "success" | "error" | "default" => {
    const colors: Record<StudentExamStatus, "warning" | "success" | "error" | "default"> = {
      pendente: "warning",
      aprovado: "success",
      ausente: "error",
      desqualificado: "default",
    };
    return colors[status] ?? "default";
  },
};
