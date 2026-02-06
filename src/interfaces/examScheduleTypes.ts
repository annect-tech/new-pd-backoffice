/**
 * Interfaces para o Agendamento de Provas
 * Baseado na documentação da API de Agendamento de Provas
 */

// ============== LOCAL DE PROVA ==============

// Local de prova (exam_local)
export interface ExamLocal {
  id: string;
  name: string;
  full_address: string;
  allowed_city_id: string;
}

// Payload para criar local
export interface ExamLocalPayload {
  name: string;
  full_address: string;
  allowed_city_id: number;
}

// ============== DATA DE PROVA ==============

// Data de prova (exam_date)
export interface ExamDate {
  id: string;
  date: string; // formato: DD/MM/YYYY
  local_id: string;
  local?: ExamLocal;
}

// Payload para criar data
export interface ExamDatePayload {
  date: string; // formato: DD/MM/YYYY
  local_id?: string;
}

// ============== HORÁRIO DE PROVA ==============

// Horário de prova (exam_hour)
export interface ExamHour {
  id: string;
  hour: string; // formato: HH:mm
  exam_date_id: string;
}

// Payload para criar horário individual
export interface ExamHourPayload {
  hour: string; // formato: HH:mm
  exam_date_id: number;
}

// ============== CRIAÇÃO EM LOTE ==============

// Payload para criação bulk de datas e horários
export interface ScheduleBulkPayload {
  local_id: number;
  schedules: {
    date: string; // formato: DD/MM/YYYY
    hours: string[]; // formato: HH:mm[]
  }[];
}

// ============== STUDENT EXAM ==============

// Status possíveis do aluno
export type StudentExamStatus = 'pendente' | 'aprovado' | 'ausente' | 'desqualificado' | string;

// Dados do usuário associado ao student exam
export interface StudentUserData {
  cpf: string;
  celphone: string;
  user: {
    first_name: string;
    last_name: string;
  };
}

// Horário agendado do aluno (com informações completas)
export interface StudentExamScheduledHour {
  hour: string;
  exam_date: {
    date: string;
    local: {
      name: string;
    };
  };
}

// Registro de prova do aluno (student_exam)
export interface StudentExam {
  id: string;
  user_data_id: number;
  score: number;
  status: StudentExamStatus;
  exam_scheduled_hour_id: string | null;
  user_data?: StudentUserData;
  exam_scheduled_hour?: StudentExamScheduledHour;
}

// Payload para inscrever/atualizar aluno
export interface StudentExamPayload {
  user_data_id?: number;
  exam_scheduled_hour_id?: number | null;
  score?: number;
  status?: StudentExamStatus;
}

// ============== GRADE DE ALUNOS ==============

// Aluno na grade de visualização
export interface StudentInSchedule {
  exam_id: string;
  user_id: number;
  name: string;
  email: string;
  birth_date: string;
  cpf: string;
  status: StudentExamStatus;
}

// Resposta do endpoint de grade por horário
export interface ScheduleGridResponse {
  [hour: string]: {
    count: number;
    students: StudentInSchedule[];
  };
}

// ============== WIZARD ==============

// Estrutura para o wizard de agendamento
export interface ScheduleWizardData {
  selectedDates: Date[];
  defaultHours: string[];
  customHoursByDate: Record<string, string[]>; // key: date ISO string
  localId?: string;
}

// Estado de uma data com horários personalizados
export interface DateWithCustomHours {
  date: Date;
  hours: string[];
  isCustomized: boolean;
}

// ============== PAGINAÇÃO ==============

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
