import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  cpf?: string; // Pode vir do auth_user.cpf
  celphone?: string; // Pode vir de relacionamento com seletivo_userdata
}

export interface CreateUserPayload {
  username: string;
  first_name: string;
  last_name: string;
  social_name?: string;
  email: string;
  cpf: string;
  password: string;
  tenant_city_id: string;
  // birth_date não é aceito pelo backend no CreateUser
  // birth_date?: string;
}

export interface CreateUserResponse {
  id: number;
}

export interface ToggleActivePayload {
  is_active: boolean;
}

export interface ToggleActiveResponse {
  message: string;
}

export interface UserProfileResponse {
  id: string;
  user_id: number;
  cpf?: string;
  personal_email?: string;
  bio?: string;
  occupation?: string;
  department?: string;
  work_location?: string;
  manager?: string;
  profile_photo?: string;
  birth_date?: string;
  hire_date?: string;
  created_at?: string;
  equipment_patrimony?: string;
  user_display?: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export const usersService = {
  /**
   * Lista todos os usuários com paginação
   * Filtra por tenant do usuário logado
   */
  listUsers: (page: number = 1, size: number = 10) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<UserResponse>>(
      API_URL,
      `/${prefix}/users`,
      {
        queryParams: {
          page,
          size,
        },
      }
    );
  },

  /**
   * Lista TODOS os usuários (sem filtro de tenant)
   * Requer role ADMIN_MASTER
   */
  listAllUsers: (page: number = 1, size: number = 10) => {
    return httpClient.get<PaginatedResponse<UserResponse>>(
      API_URL,
      "/admin/users/admin-master",
      {
        queryParams: {
          page,
          size,
        },
      }
    );
  },

  /**
   * Obtém um usuário específico por ID
   * Requer role ADMIN ou ADMIN_MASTER
   */
  getUserById: (id: number | string) =>
    httpClient.get<UserResponse>(
      API_URL,
      `/admin/users/${id}`
    ),

  /**
   * Cria um novo usuário
   * Requer role ADMIN ou ADMIN_MASTER
   */
  createUser: (payload: CreateUserPayload) =>
    httpClient.post<CreateUserResponse>(
      API_URL,
      "/admin/users",
      payload
    ),

  /**
   * Ativa ou desativa um usuário pelo email
   * Requer role ADMIN ou ADMIN_MASTER
   */
  toggleUserActive: (email: string, isActive: boolean) =>
    httpClient.put<ToggleActiveResponse>(
      API_URL,
      "/admin/users/active",
      email,
      { is_active: isActive }
    ),

  /**
   * Lista todos os perfis de usuários com paginação
   */
  listProfiles: (page: number = 1, size: number = 10) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<UserProfileResponse>>(
      API_URL,
      `/${prefix}/user-profiles`,
      {
        queryParams: {
          page,
          size,
        },
      }
    );
  },

  /**
   * Obtém um perfil específico por ID
   */
  getProfileById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<UserProfileResponse>(
      API_URL,
      `/${prefix}/user-profiles/${id}`
    );
  },

  /**
   * Obtém o perfil do usuário logado
   * Busca todos os perfis e filtra pelo user_id
   * Requer role ADMIN ou ADMIN_MASTER
   */
  getMyProfile: async (userId: number): Promise<UserProfileResponse | null> => {
    try {
      const response = await usersService.listProfiles(1, 1000);
      
      let profiles: UserProfileResponse[] = [];
      
      if (response.status === 200) {
        if (Array.isArray(response.data)) {
          profiles = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          profiles = response.data.data;
        }
        
        if (profiles.length > 0) {
          const profile = profiles.find(
            (p) => {
              const profileUserId = typeof p.user_id === 'string' ? parseInt(p.user_id, 10) : Number(p.user_id);
              const searchUserId = typeof userId === 'string' ? parseInt(userId, 10) : Number(userId);
              return profileUserId === searchUserId;
            }
          );
          
          if (profile) {
            return profile;
          }
        }
      }
      
      return null;
    } catch {
      return null;
    }
  },
};
