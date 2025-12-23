export interface ExamScheduled {
  id: number;
  score?: number;
  status: "scheduled" | "absent" | "present";
  user_data: {
    cpf: string;
    celphone?: string;
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
  };
}


