/**
 * Resposta ATUAL da API - Backend retorna apenas IDs
 * Esta é a estrutura real que vem do endpoint GET /admin/student-exams
 */
export interface ExamScheduledApiResponse {
  id: string;
  user_data_id: number;
  score: number;
  status: "scheduled" | "absent" | "present";
  exam_scheduled_hour_id: string | null;
}

/**
 * Estrutura COMPLETA (Futura) - Quando o backend for corrigido para incluir JOINs
 * Esta será a resposta ideal após implementação da Solução 1 do relatório
 */
export interface ExamScheduledComplete {
  id: string;
  score: number;
  status: "scheduled" | "absent" | "present";
  user_data: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    cpf: string;
    celphone?: string;
  };
  exam_schedule_info: {
    hour: string;
    date: string;
    local_name: string;
    local_address: string;
  } | null;
}

/**
 * Interface de compatibilidade - Usado no frontend
 * Mantém compatibilidade com código existente
 */
export interface ExamScheduled extends ExamScheduledApiResponse {
  // Campos opcionais que podem vir de outras fontes (ex: merge com auth_users)
  user_data?: {
    cpf: string;
    celphone?: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
  exam_scheduled_hour?: {
    hour: string;
    exam_date: {
      date: string;
      local: {
        name: string;
      };
    };
  };
}


