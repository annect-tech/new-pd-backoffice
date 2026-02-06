/**
 * Resposta da API - GET /user/student-exams e GET /user/student-exams/{id}
 * Estrutura conforme documentação de integração
 */

import type { StudentExamStatus } from "./examScheduleTypes";

export interface Exam {
  id: string;
  user_data_id: number;
  score: number;
  status: StudentExamStatus;
  exam_scheduled_hour_id: string | null;
  user_data?: {
    cpf: string;
    celphone: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
  exam_scheduled_hour?: {
    hour: string;
    exam_date: {
      date: string; // formato: DD/MM/YYYY
      local: {
        name: string;
      };
    };
  };
}
