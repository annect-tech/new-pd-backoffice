export interface LoginPayload {
  credential: string; // Aceita email, CPF ou username
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password2: string;
}

export interface User {
  id: number; // Mapeado de 'sub' do JWT
  roles: string[]; // Array de roles (ex: ['ADMIN', 'USER'])
  tenant_city_id: string;
  // Dados adicionais virão do perfil do usuário
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_photo?: string; // Adicionado do interface-redesign
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string; // Renomeado de 'access'
  refreshToken: string; // Renomeado de 'refresh'
  // Backend NÃO retorna user no login - deve ser extraído do JWT
}

export interface RegisterResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  access: string;
  refresh: string;
}

export interface RefreshTokenPayload {
  refreshToken: string; // Renomeado de 'refresh'
}

export interface RefreshTokenResponse {
  accessToken: string; // Renomeado de 'access'
  refreshToken: string; // Renomeado de 'refresh'
}

// Interface para o payload do JWT decodificado
export interface JWTPayload {
  sub: number; // user_id
  roles: string[];
  tenant_city_id: string;
  iat?: number;
  exp?: number;
}