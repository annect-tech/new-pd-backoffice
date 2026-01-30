/**
 * Resposta da API - GET /admin/student-exams
 * Estrutura conforme documentação Swagger
 */
export interface ExamScheduled {
  id: string;
  user_data_id: number;
  score: number;
  status: "scheduled" | "absent" | "present" | string;
  exam_scheduled_hour_id: string | null;
  user_data: {
    cpf: string;
    celphone: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
  exam_scheduled_hour: {
    hour: string;
    exam_date: {
      date: string;
      local: {
        name: string;
      };
    };
  } | null;
}


