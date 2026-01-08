import {
  type LoginPayload,
  type LoginResponse,
  type RegisterPayload,
  type RegisterResponse,
  type RefreshTokenPayload,
  type RefreshTokenResponse,
  type LogoutPayload,
  type LogoutResponse,
} from "../../../interfaces/authInterfaces";
import { ENDPOINTS } from "../../../util/constants";
import { httpClient } from "../httpClient";

const API_URL = import.meta.env.VITE_API_URL as string;

export const authService = {
  login: (payload: LoginPayload) =>
    httpClient.post<LoginResponse>(API_URL, ENDPOINTS.AUTH.LOGIN, payload),

  register: (payload: RegisterPayload) =>
    httpClient.post<RegisterResponse>(API_URL, ENDPOINTS.AUTH.REGISTER, payload),

  refreshToken: (payload: RefreshTokenPayload) =>
    httpClient.post<RefreshTokenResponse>(
      API_URL,
      ENDPOINTS.AUTH.REFRESH_TOKEN,
      payload
    ),

  logout: (payload: LogoutPayload) =>
    httpClient.post<LogoutResponse>(API_URL, ENDPOINTS.AUTH.LOGOUT, payload),
};
