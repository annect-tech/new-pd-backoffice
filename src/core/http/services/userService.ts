import { httpClient } from "../httpClient";
import { ENDPOINTS } from "../../../util/constants";

const API_URL = import.meta.env.VITE_API_URL as string;

export interface UserProfile {
  id: number;
  cpf: string;
  personal_email: string;
  bio?: string;
  birth_date?: string;
  hire_date?: string;
  occupation?: string;
  department?: string;
  equipment_patrimony?: string;
  work_location?: string;
  manager?: string;
  profile_photo?: string;
  user_display?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
  };
}

export interface CreateUserProfilePayload {
  cpf: string;
  personal_email: string;
  bio?: string;
  birth_date?: string;
  hire_date?: string;
  occupation?: string;
  department?: string;
  equipment_patrimony?: string;
  work_location?: string;
  manager?: string;
}

export interface UserProfilesListResponse {
  results: UserProfile[];
  count: number;
  next?: string;
  previous?: string;
}

export const userService = {
  // Obter perfil do usuário logado
  getMyProfile: () =>
    httpClient.get<UserProfile>(API_URL, `${ENDPOINTS.ADMIN.USER_PROFILES}/me`),

  // Criar perfil
  createProfile: (payload: CreateUserProfilePayload) =>
    httpClient.post<UserProfile>(
      API_URL,
      ENDPOINTS.ADMIN.USER_PROFILES,
      payload
    ),

  // Upload de foto de perfil
  uploadPhoto: async (profileId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${API_URL}${ENDPOINTS.ADMIN.USER_PROFILES}/${profileId}/upload-photo`;
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    return res.json();
  },

  // Listar todos os perfis
  listProfiles: () =>
    httpClient.get<UserProfilesListResponse>(
      API_URL,
      ENDPOINTS.ADMIN.USER_PROFILES
    ),

  // Obter perfil específico por ID
  getProfileById: (id: number) =>
    httpClient.get<UserProfile>(API_URL, `${ENDPOINTS.ADMIN.USER_PROFILES}/${id}`),

  // Atualizar perfil
  updateProfile: (id: number, payload: Partial<CreateUserProfilePayload>) =>
    httpClient.patch<UserProfile>(
      API_URL,
      `${ENDPOINTS.ADMIN.USER_PROFILES}/${id}`,
      payload
    ),

  // Deletar perfil
  deleteProfile: (id: number) =>
    httpClient.delete(API_URL, `${ENDPOINTS.ADMIN.USER_PROFILES}/${id}`),
};
