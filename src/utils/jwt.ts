import type { JWTPayload } from "../interfaces/authInterfaces";

/**
 * Decodifica um JWT token e retorna seu payload
 * @param token - JWT token a ser decodificado
 * @returns Payload do JWT decodificado
 * @throws Error se o token for inválido
 */
export const decodeJWT = (token: string): JWTPayload => {
  try {
    // Separa o token em suas partes
    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error('Token JWT inválido');
    }

    // Pega a parte do payload (segunda parte)
    const base64Url = parts[1];

    // Converte de base64url para base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decodifica o base64
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[JWT] Erro ao decodificar token:', error);
    throw new Error('Não foi possível decodificar o token JWT');
  }
};

/**
 * Verifica se um JWT token está expirado
 * @param token - JWT token a ser verificado
 * @returns true se o token está expirado, false caso contrário
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeJWT(token);

    if (!payload.exp) {
      return false; // Se não tem exp, consideramos não expirado
    }

    // exp está em segundos, Date.now() está em milissegundos
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();

    return currentTime > expirationTime;
  } catch (error) {
    console.error('[JWT] Erro ao verificar expiração:', error);
    return true; // Em caso de erro, consideramos expirado
  }
};

/**
 * Extrai informações do usuário do JWT token
 * @param token - JWT token
 * @returns Objeto com informações do usuário
 */
export const getUserFromToken = (token: string) => {
  try {
    const payload = decodeJWT(token);

    return {
      id: payload.sub,
      roles: payload.roles,
      tenant_city_id: payload.tenant_city_id,
    };
  } catch (error) {
    console.error('[JWT] Erro ao extrair usuário do token:', error);
    return null;
  }
};
