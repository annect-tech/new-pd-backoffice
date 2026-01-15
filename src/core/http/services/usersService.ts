import { httpClient } from "../httpClient";

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
   * Requer role ADMIN ou ADMIN_MASTER
   * Filtra por tenant do admin logado
   */
  listUsers: (page: number = 1, size: number = 10) => {
    return httpClient.get<PaginatedResponse<UserResponse>>(
      API_URL,
      "/admin/users",
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
   * Requer role ADMIN ou ADMIN_MASTER
   */
  listProfiles: (page: number = 1, size: number = 10) => {
    return httpClient.get<PaginatedResponse<UserProfileResponse>>(
      API_URL,
      "/admin/user-profiles",
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
   * Requer role ADMIN ou ADMIN_MASTER
   */
  getProfileById: (id: string | number) =>
    httpClient.get<UserProfileResponse>(
      API_URL,
      `/admin/user-profiles/${id}`
    ),

  /**
   * Obtém o perfil do usuário logado
   * Busca todos os perfis e filtra pelo user_id
   * Requer role ADMIN ou ADMIN_MASTER
   */
  getMyProfile: async (userId: number): Promise<UserProfileResponse | null> => {
    try {
      console.log("[usersService] Buscando perfil para userId:", userId, "tipo:", typeof userId);
      
      // Busca todos os perfis e filtra pelo user_id no frontend
      // Como não há endpoint específico, buscamos todos e filtramos
      const response = await usersService.listProfiles(1, 1000);
      
      console.log("[usersService] Resposta completa da API:", JSON.stringify(response, null, 2));
      console.log("[usersService] Status:", response.status);
      console.log("[usersService] Data:", response.data);
      
      // Verifica diferentes formatos de resposta
      let profiles: UserProfileResponse[] = [];
      
      if (response.status === 200) {
        // Tenta diferentes formatos de resposta
        if (Array.isArray(response.data)) {
          // Se a resposta é um array direto
          profiles = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          // Se a resposta tem estrutura { data: [...], meta: {...} }
          profiles = response.data.data;
        } else if (response.data?.results && Array.isArray(response.data.results)) {
          // Se a resposta tem estrutura { results: [...] }
          profiles = response.data.results;
        }
        
        console.log("[usersService] Total de perfis encontrados:", profiles.length);
        console.log("[usersService] Perfis:", profiles);
        
        if (profiles.length > 0) {
          const profile = profiles.find(
            (p) => {
              // Compara convertendo ambos para número para evitar problemas de tipo
              const profileUserId = typeof p.user_id === 'string' ? parseInt(p.user_id, 10) : Number(p.user_id);
              const searchUserId = typeof userId === 'string' ? parseInt(userId, 10) : Number(userId);
              console.log("[usersService] Comparando perfil:", {
                profileUserId,
                searchUserId,
                profileUserIdType: typeof profileUserId,
                searchUserIdType: typeof searchUserId,
                match: profileUserId === searchUserId
              });
              return profileUserId === searchUserId;
            }
          );
          
          if (profile) {
            console.log("[usersService] ✅ Perfil encontrado:", profile);
            return profile;
          } else {
            console.log("[usersService] ❌ Perfil não encontrado para userId:", userId);
            console.log("[usersService] User IDs disponíveis:", profiles.map(p => p.user_id));
          }
        } else {
          console.log("[usersService] Nenhum perfil retornado pela API");
        }
      } else {
        console.log("[usersService] Status da resposta não é 200:", response.status);
        console.log("[usersService] Mensagem:", response.message);
      }
      
      return null;
    } catch (error) {
      console.error("[usersService] Erro ao buscar perfil do usuário:", error);
      return null;
    }
  },
};
