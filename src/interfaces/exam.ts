export interface Exam {
  id: number;
  score?: number;
  status: string;
  user_data_id?: number | string;
  user_data?: {
    cpf?: string;
    user?: {
      first_name?: string;
      last_name?: string;
    };
  };
  exam_scheduled_hour_id?: string | number | null;
  exam_scheduled_hour?: {
    hour?: string;
    exam_date?: {
      date?: string;
      local?: {
        name?: string;
      };
    };
  };
}


