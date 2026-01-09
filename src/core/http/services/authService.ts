import {
  type LoginPayload,
  type LoginResponse,
  type RefreshTokenPayload,
  type RefreshTokenResponse,
} from "../../../interfaces/authInterfaces";
import { ENDPOINTS } from "../../../util/constants";
import { httpClient } from "../httpClient";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

// Debug: verificar qual URL está sendo usada
console.log("[authService] API_URL configurada:", API_URL);
console.log("[authService] VITE_API_URL do env:", import.meta.env.VITE_API_URL);

export const authService = {
  login: (payload: LoginPayload) =>
    httpClient.post<LoginResponse>(API_URL, ENDPOINTS.AUTH.LOGIN, payload),

  // Registro removido - não existe endpoint público no backend
  // Apenas administradores podem criar usuários via POST /admin/users

  refreshToken: (payload: RefreshTokenPayload) =>
    httpClient.post<RefreshTokenResponse>(
      API_URL,
      ENDPOINTS.AUTH.REFRESH_TOKEN,
      payload
    ),
};
