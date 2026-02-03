import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";
import { getApiUrl } from "../apiUrl";
import type {
  ExamLocal,
  ExamDate,
  ExamHour,
  ExamLocalPayload,
  ExamDatePayload,
  ExamHourPayload,
  ScheduleBulkPayload,
  PaginatedResponse,
} from "../../../interfaces/examScheduleTypes";

const API_URL = getApiUrl();

export const examScheduleService = {
  // ============== LOCAIS DE PROVA ==============
  // Base URL: /user/exam

  /**
   * Cria um novo local de prova
   * POST /user/exam
   */
  createLocal: (payload: ExamLocalPayload) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<{ id: string; message: string }>(
      API_URL,
      `/${prefix}/exam`,
      payload
    );
  },

  /**
   * Lista todos os locais de prova (paginado)
   * GET /user/exam
   */
  listLocals: (page: number = 1, limit: number = 10, search?: string) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<ExamLocal>>(
      API_URL,
      `/${prefix}/exam`,
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
   * Busca um local de prova por ID
   * GET /user/exam/:id
   */
  getLocalById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<ExamLocal>(API_URL, `/${prefix}/exam/${id}`);
  },

  /**
   * Atualiza um local de prova
   * PATCH /user/exam/:id
   */
  updateLocal: (id: string | number, payload: Partial<ExamLocalPayload>) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<{ message: string }>(
      API_URL,
      `/${prefix}/exam`,
      id,
      payload
    );
  },

  /**
   * Deleta um local de prova
   * DELETE /user/exam/:id
   */
  deleteLocal: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.delete<{ message: string }>(
      API_URL,
      `/${prefix}/exam`,
      id
    );
  },

  // ============== DATAS DE PROVA ==============
  // Base URL: /user/exam/dates

  /**
   * Cria datas e horários em lote (bulk)
   * POST /user/exam/dates
   * 
   * Este endpoint cria múltiplas datas com seus respectivos horários de uma só vez.
   */
  createDatesBulk: (payload: ScheduleBulkPayload) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<{ message: string }>(
      API_URL,
      `/${prefix}/exam/dates`,
      payload
    );
  },

  /**
   * Lista datas de um local específico
   * GET /user/exam/dates/:localId
   */
  listDates: (localId: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<ExamDate[]>(
      API_URL,
      `/${prefix}/exam/dates/${localId}`
    );
  },

  /**
   * Busca uma data por ID
   * GET /user/exam/date-by-id/:id
   */
  getDateById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<ExamDate>(
      API_URL,
      `/${prefix}/exam/date-by-id/${id}`
    );
  },

  /**
   * Atualiza uma data de prova
   * PATCH /user/exam/dates/:id
   */
  updateDate: (id: string | number, payload: ExamDatePayload) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<{ message: string }>(
      API_URL,
      `/${prefix}/exam/dates`,
      id,
      payload
    );
  },

  /**
   * Deleta uma data de prova (e todos os horários associados)
   * DELETE /user/exam/dates/:id
   */
  deleteDate: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.delete<{ message: string }>(
      API_URL,
      `/${prefix}/exam/dates`,
      id
    );
  },

  // ============== HORÁRIOS DE PROVA ==============
  // Base URL: /user/exam/hours

  /**
   * Cria um horário individual
   * POST /user/exam/hours
   */
  createHour: (payload: ExamHourPayload) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<{ id: string; message: string }>(
      API_URL,
      `/${prefix}/exam/hours`,
      payload
    );
  },

  /**
   * Lista horários de uma data específica
   * GET /user/exam/hours/:dateId
   */
  listHours: (dateId: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<ExamHour[]>(
      API_URL,
      `/${prefix}/exam/hours/${dateId}`
    );
  },

  /**
   * Busca um horário por ID
   * GET /user/exam/hour-by-id/:id
   */
  getHourById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<ExamHour>(
      API_URL,
      `/${prefix}/exam/hour-by-id/${id}`
    );
  },

  /**
   * Atualiza um horário
   * PATCH /user/exam/hours/:id
   */
  updateHour: (id: string | number, payload: { hour: string }) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<{ message: string }>(
      API_URL,
      `/${prefix}/exam/hours`,
      id,
      payload
    );
  },

  /**
   * Deleta um horário
   * DELETE /user/exam/hours/:id
   */
  deleteHour: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.delete<{ message: string }>(
      API_URL,
      `/${prefix}/exam/hours`,
      id
    );
  },

  // ============== UTILITÁRIOS ==============

  /**
   * Converte data do formato Date para DD/MM/YYYY
   */
  formatDateToAPI: (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  },

  /**
   * Converte data do formato DD/MM/YYYY para Date
   */
  parseDateFromAPI: (dateStr: string): Date => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  },

  /**
   * Formata horário para HH:mm (garantindo 2 dígitos)
   */
  formatHourToAPI: (hour: string): string => {
    const [h, m] = hour.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  },
};
