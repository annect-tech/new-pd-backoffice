export interface UserProfile {
  id: number;
  username: string;
  email: string;
  cpf?: string;
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  celphone?: string;
  allowed_city?: {
    active: boolean;
    localidade: string;
    uf: string;
  };
  personas?: Record<string, any>;
  addresses?: Address[];
  guardians?: Guardian[];
  registration_data?: Record<string, any>;
  contract?: {
    status: string;
  };
}

export interface Address {
  id: number;
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  localidade: string;
  uf: string;
  user_data_id?: number;
}

export interface Guardian {
  cpf: string;
  relationship: string;
  name: string;
  cellphone: string;
  email: string;
}


