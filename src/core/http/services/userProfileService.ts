import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";
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
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<UserProfile>>(
      API_URL,
      `/${prefix}/user-profiles`,
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
  getById: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<UserProfile>(
      API_URL,
      `/${prefix}/user-profiles/${id}`
    );
  },

  /**
   * Obtém perfil por user_id (workaround - busca e filtra no frontend)
   * @param userId - ID do usuário
   */
  getByUserId: async (userId: number): Promise<UserProfile | null> => {
    const prefix = getEndpointPrefix();
    const response = await httpClient.get<PaginatedResponse<UserProfile>>(
      API_URL,
      `/${prefix}/user-profiles`,
      {
        queryParams: {
          page: 1,
          size: 1000,
        },
      }
    );

    if (response.status === 200 && response.data?.data) {
      const profile = response.data.data.find((p) => {
        const profileUserId = typeof p.user_id === 'string' ? parseInt(p.user_id, 10) : Number(p.user_id);
        const searchUserId = typeof userId === 'string' ? parseInt(userId, 10) : Number(userId);
        return profileUserId === searchUserId;
      });
      
      if (profile) {
        return profile;
      } else {
        return null;
      }
    }

    return null;
  },

  /**
   * Obtém perfil por CPF (workaround - busca e filtra no frontend)
   * @param cpf - CPF do usuário (com ou sem formatação)
   */
  getByCpf: async (cpf: string): Promise<UserProfile | null> => {
    const cleanCpf = cpf.replace(/\D/g, '');
    const prefix = getEndpointPrefix();
    
    const response = await httpClient.get<PaginatedResponse<UserProfile>>(
      API_URL,
      `/${prefix}/user-profiles`,
      {
        queryParams: {
          page: 1,
          size: 1000,
        },
      }
    );

    if (response.status === 200 && response.data?.data) {
      const profile = response.data.data.find((p) => {
        if (!p.cpf) return false;
        const profileCpf = p.cpf.replace(/\D/g, '');
        return profileCpf === cleanCpf;
      });
      
      if (profile) {
        return profile;
      } else {
        return null;
      }
    }

    return null;
  },

  /**
   * Cria um novo perfil de usuário (admin)
   * @param payload - Dados do perfil
   */
  create: (payload: UserProfilePayload & { user_id: number }) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<CreateUserProfileResponse>(
      API_URL,
      `/${prefix}/user-profiles`,
      payload
    );
  },

  /**
   * Atualiza um perfil existente (admin)
   * @param id - ID do perfil
   * @param payload - Dados atualizados
   */
  update: (id: string | number, payload: Partial<UserProfilePayload>) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<UpdateUserProfileResponse>(
      API_URL,
      `/${prefix}/user-profiles`,
      id,
      payload
    );
  },

  /**
   * Deleta um perfil (admin)
   * @param id - ID do perfil
   */
  delete: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.delete<{ message: string }>(
      API_URL,
      `/${prefix}/user-profiles`,
      id
    );
  },

  /**
   * Faz upload de foto de perfil (admin)
   * @param profileId - ID do perfil
   * @param file - Arquivo de imagem
   */
  uploadPhoto: (profileId: string, file: File) => {
    const prefix = getEndpointPrefix();
    return httpClient.uploadFile<UploadPhotoResponse>(
      API_URL,
      `/${prefix}/user-profiles/upload-photo`,
      file,
      { id: profileId }
    );
  },
};
