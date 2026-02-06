import { getApiUrl } from "../apiUrl";
import { httpClient } from "../httpClient";

const API_URL = getApiUrl();

/**
 * Representa uma Role do sistema
 */
export interface Role {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Payload para setar roles de um usuário
 */
export interface SetUserRolesPayload {
  targetUserId: number;
  rolesIds: string[];
}

/**
 * Resposta padrão para operações de escrita
 */
export interface DefaultMessageResponse {
  message: string;
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

const prefix = 'user';

export const roleService = {
  /**
   * Lista todas as roles disponíveis no sistema
   */
  listAllRoles: () => {
    return httpClient.get<PaginatedResponse<Role>>(
      API_URL,
      `/${prefix}/roles`
    );
  },

  /**
   * Lista todas as roles de um usuário específico
   * @param userId - ID do usuário
   */
  listUserRoles: (userId: number) => {
    return httpClient.get<Role[]>(
      API_URL,
      `/${prefix}/roles/find-roles-by-user-id/${userId}`
    );
  },

  /**
   * Busca uma role específica pelo ID
   * @param roleId - ID da role
   */
  getRoleById: (roleId: string) => {
    return httpClient.get<Role>(
      API_URL,
      `/${prefix}/roles/${roleId}`
    );
  },

  /**
   * Define (sobrescreve) todas as roles de um usuário
   * ⚠️ Sempre enviar TODAS as roles atuais do usuário
   *
   * @param payload - targetUserId e array de roleIds
   */
  setUserRoles: (payload: SetUserRolesPayload) => {
    return httpClient.customPatch<DefaultMessageResponse>(
      API_URL,
      `/${prefix}/roles/set-user-roles`,
      payload,
    );
  },
};