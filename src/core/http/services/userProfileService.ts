import { httpClient } from "../httpClient";
import type { UserProfilePayload } from "../../../interfaces/profile";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface UserProfile {
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
  updated_at?: string;
  user_display?: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CreateUserProfileResponse {
  id: string;
  message: string;
}

export interface UpdateUserProfileResponse {
  message: string;
}

export interface UploadPhotoResponse {
  url: string;
  message: string;
}

export const userProfileService = {
  /**
   * Lista todos os perfis de usuário com paginação (admin)
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    return httpClient.get<PaginatedResponse<UserProfile>>(
      API_URL,
      "/admin/user-profiles",
      {
        queryParams: {
          page,
          size,
          ...(search ? { search } : {}),
        },
      }
    );
  },

  /**
   * Obtém um perfil específico por ID (admin)
   * @param id - ID do perfil
   */
  getById: (id: string | number) =>
    httpClient.get<UserProfile>(
      API_URL,
      `/admin/user-profiles/${id}`
    ),

  /**
   * Obtém perfil por user_id (workaround - busca e filtra no frontend)
   * @param userId - ID do usuário
   */
  getByUserId: async (userId: number): Promise<UserProfile | null> => {
    console.log(`[userProfileService] Buscando perfil para userId: ${userId}`);
    
    const response = await httpClient.get<PaginatedResponse<UserProfile>>(
      API_URL,
      "/admin/user-profiles",
      {
        queryParams: {
          page: 1,
          size: 1000, // Buscar muitos para garantir que encontre
        },
      }
    );

    console.log(`[userProfileService] Resposta da busca de perfis:`, {
      status: response.status,
      hasData: !!response.data,
      dataLength: response.data?.data?.length || 0
    });

    if (response.status === 200 && response.data?.data) {
      const profile = response.data.data.find((p) => {
        const profileUserId = typeof p.user_id === 'string' ? parseInt(p.user_id, 10) : Number(p.user_id);
        const searchUserId = typeof userId === 'string' ? parseInt(userId, 10) : Number(userId);
        return profileUserId === searchUserId;
      });
      
      if (profile) {
        console.log(`[userProfileService] ✅ Perfil encontrado:`, profile);
        return profile;
      } else {
        console.log(`[userProfileService] ❌ Perfil não encontrado para userId: ${userId}`);
        console.log(`[userProfileService] User IDs disponíveis:`, response.data.data.map(p => p.user_id));
        return null;
      }
    }

    // Se status não for 200, logar mas não lançar erro (pode ser problema de permissão, etc)
    if (response.status !== 200) {
      console.warn(`[userProfileService] Status não é 200 ao buscar perfis: ${response.status}`, response.message);
    }

    return null;
  },

  /**
   * Obtém perfil por CPF (workaround - busca e filtra no frontend)
   * @param cpf - CPF do usuário (com ou sem formatação)
   */
  getByCpf: async (cpf: string): Promise<UserProfile | null> => {
    // Remove formatação do CPF para busca
    const cleanCpf = cpf.replace(/\D/g, '');
    console.log(`[userProfileService] Buscando perfil para CPF: ${cleanCpf} (original: ${cpf})`);
    
    const response = await httpClient.get<PaginatedResponse<UserProfile>>(
      API_URL,
      "/admin/user-profiles",
      {
        queryParams: {
          page: 1,
          size: 1000, // Buscar muitos para garantir que encontre
        },
      }
    );

    console.log(`[userProfileService] Resposta da busca de perfis por CPF:`, {
      status: response.status,
      hasData: !!response.data,
      dataLength: response.data?.data?.length || 0
    });

    if (response.status === 200 && response.data?.data) {
      const profile = response.data.data.find((p) => {
        if (!p.cpf) return false;
        const profileCpf = p.cpf.replace(/\D/g, '');
        return profileCpf === cleanCpf;
      });
      
      if (profile) {
        console.log(`[userProfileService] ✅ Perfil encontrado por CPF:`, profile);
        return profile;
      } else {
        console.log(`[userProfileService] ❌ Perfil não encontrado para CPF: ${cleanCpf}`);
        console.log(`[userProfileService] CPFs disponíveis:`, response.data.data.filter(p => p.cpf).map(p => p.cpf));
        return null;
      }
    }

    // Se status não for 200, logar mas não lançar erro (pode ser problema de permissão, etc)
    if (response.status !== 200) {
      console.warn(`[userProfileService] Status não é 200 ao buscar perfis por CPF: ${response.status}`, response.message);
    }

    return null;
  },

  /**
   * Cria um novo perfil de usuário (admin)
   * @param payload - Dados do perfil
   */
  create: (payload: UserProfilePayload & { user_id: number }) =>
    httpClient.post<CreateUserProfileResponse>(
      API_URL,
      "/admin/user-profiles",
      payload
    ),

  /**
   * Atualiza um perfil existente (admin)
   * @param id - ID do perfil
   * @param payload - Dados atualizados
   */
  update: (id: string | number, payload: Partial<UserProfilePayload>) =>
    httpClient.patch<UpdateUserProfileResponse>(
      API_URL,
      "/admin/user-profiles",
      id,
      payload
    ),

  /**
   * Deleta um perfil (admin)
   * @param id - ID do perfil
   */
  delete: (id: string | number) =>
    httpClient.delete<{ message: string }>(
      API_URL,
      "/admin/user-profiles",
      id
    ),

  /**
   * Faz upload de foto de perfil (admin)
   * @param profileId - ID do perfil
   * @param file - Arquivo de imagem
   */
  uploadPhoto: (profileId: string, file: File) =>
    httpClient.uploadFile<UploadPhotoResponse>(
      API_URL,
      "/admin/user-profiles/upload-photo",
      file,
      { id: profileId }
    ),
};
