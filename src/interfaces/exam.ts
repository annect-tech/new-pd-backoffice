/**
 * Resposta da API - GET /admin/student-exams e GET /admin/student-exams/{id}
 * Estrutura conforme documentação Swagger
 */
export interface Exam {
  id: string;
  user_data_id: number;
  score: number;
  status: string;
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


