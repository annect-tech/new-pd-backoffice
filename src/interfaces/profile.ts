/**
 * Interface para payload de criação de perfil de usuário
 */
export type UserProfilePayload = {
  cpf?: string;
  personal_email?: string;
  bio?: string;
  birth_date?: string;
  hire_date?: string;
  occupation?: string;
  department?: string;
  equipment_patrimony?: string;
  work_location?: string;
  manager?: string;
};

