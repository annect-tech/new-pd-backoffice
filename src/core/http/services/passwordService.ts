import { httpClient } from "../httpClient";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface ForgotPasswordResponse {
  success: boolean,
  message: string
}

export interface ResetPasswordResponse {
  success: boolean,
  message: string
}

export interface ResetPasswordErrorResponse {
  message: string;
  statusCode: number;
}


export const PasswordService = {
  forgotPassword: async (credential: string): Promise<ForgotPasswordResponse> => {
    try {
      const response = await httpClient.post<ForgotPasswordResponse>(API_URL, '/security/forgot-password', { credential });
      return response.data ? response.data : { message: '', success: true };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao processar solicitação');
    }
  },

  resetPassword: async (
  credential: string,
  code: string,
  password: string,
  confirmPassword: string
): Promise<ResetPasswordResponse> => {
  try {
    const response = await httpClient.post<ResetPasswordResponse>(
      API_URL,
      '/security/reset-password',
      { credential, code, password, confirmPassword }
    );

    return response.data || { message: 'Erro ao resetar senha', success: true };
  } catch (error: any) {
    return { message: 'Erro ao resetar senha', success: true };
  }
}
};