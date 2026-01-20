import { useCallback } from "react";

/**
 * Tipos de erro HTTP comuns
 */
export enum ApiErrorType {
  VALIDATION = "VALIDATION", // 400
  UNAUTHORIZED = "UNAUTHORIZED", // 401
  FORBIDDEN = "FORBIDDEN", // 403
  NOT_FOUND = "NOT_FOUND", // 404
  SERVER_ERROR = "SERVER_ERROR", // 500
  NETWORK_ERROR = "NETWORK_ERROR", // Erro de rede
  UNKNOWN = "UNKNOWN", // Erro desconhecido
}

/**
 * Interface para resposta de erro da API
 */
export interface ApiErrorResponse {
  status?: number;
  message?: string;
  data?: any;
  error?: string | object;
}

/**
 * Interface para erro processado
 */
export interface ProcessedError {
  message: string;
  type: ApiErrorType;
  originalError?: any;
  statusCode?: number;
  details?: any;
}

/**
 * Hook para padronizar tratamento de erros da API
 * 
 * @example
 * ```typescript
 * const { processError, getErrorMessage } = useApiError();
 * 
 * try {
 *   await someApiCall();
 * } catch (error) {
 *   const processed = processError(error);
 *   showSnackbar(processed.message, "error");
 * }
 * ```
 */
export const useApiError = () => {
  /**
   * Extrai mensagem de erro de diferentes formatos
   */
  const extractErrorMessage = useCallback((error: any): string => {
    // Caso 1: String simples
    if (typeof error === "string") {
      return error;
    }

    // Caso 2: Objeto Error
    if (error instanceof Error) {
      return error.message;
    }

    // Caso 3: Resposta da API (com status e message)
    if (error?.message && typeof error.message === "string") {
      return error.message;
    }

    // Caso 4: Resposta da API (com data.message)
    if (error?.data?.message) {
      if (typeof error.data.message === "string") {
        return error.data.message;
      }
      if (Array.isArray(error.data.message)) {
        return error.data.message.join(", ");
      }
    }

    // Caso 5: Resposta da API (com data como array de mensagens)
    if (Array.isArray(error?.data)) {
      if (error.data.length > 0) {
        return error.data.join(", ");
      }
    }

    // Caso 6: Resposta da API (com data como objeto com campos de validação)
    if (error?.data && typeof error.data === "object" && !Array.isArray(error.data)) {
      const keys = Object.keys(error.data);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const firstError = error.data[firstKey];
        if (Array.isArray(firstError) && firstError.length > 0) {
          return `${firstKey}: ${firstError.join(", ")}`;
        }
        if (typeof firstError === "string") {
          return `${firstKey}: ${firstError}`;
        }
      }
    }

    // Caso 7: Resposta da API (com error como string)
    if (error?.error) {
      if (typeof error.error === "string") {
        return error.error;
      }
      if (typeof error.error === "object" && error.error.message) {
        return error.error.message;
      }
    }

    // Caso 8: Resposta da API (com statusCode e message)
    if (error?.statusCode && error?.message) {
      return error.message;
    }

    // Caso 9: Erro de rede
    if (error?.name === "NetworkError" || error?.message?.includes("network") || error?.message?.includes("fetch")) {
      return "Erro de conexão. Verifique sua internet e tente novamente.";
    }

    // Caso padrão
    return "Erro desconhecido. Tente novamente mais tarde.";
  }, []);

  /**
   * Determina o tipo de erro baseado no status HTTP
   */
  const getErrorType = useCallback((status?: number, error?: any): ApiErrorType => {
    if (!status) {
      // Verificar se é erro de rede
      if (error?.name === "NetworkError" || error?.message?.includes("network") || error?.message?.includes("fetch")) {
        return ApiErrorType.NETWORK_ERROR;
      }
      return ApiErrorType.UNKNOWN;
    }

    switch (status) {
      case 400:
        return ApiErrorType.VALIDATION;
      case 401:
        return ApiErrorType.UNAUTHORIZED;
      case 403:
        return ApiErrorType.FORBIDDEN;
      case 404:
        return ApiErrorType.NOT_FOUND;
      case 500:
      case 502:
      case 503:
      case 504:
        return ApiErrorType.SERVER_ERROR;
      default:
        return ApiErrorType.UNKNOWN;
    }
  }, []);

  /**
   * Melhora mensagem de erro baseado no tipo
   */
  const enhanceErrorMessage = useCallback(
    (message: string, type: ApiErrorType, _originalError?: any): string => {
      // Se já tem uma mensagem específica, usar ela
      if (message && message !== "Erro desconhecido. Tente novamente mais tarde.") {
        // Melhorar mensagens comuns
        if (message.includes("user profile with this cpf already exists") || 
            message.includes("cpf already exists") ||
            message.includes("CPF já cadastrado")) {
          return "Perfil de usuário com este CPF já existe.";
        }

        if (message.includes("unique constraint") || 
            message.includes("duplicate key") || 
            message.includes("already exists") ||
            message.includes("unique violation") ||
            message.includes("p2002")) {
          if (message.includes("user_id")) {
            return "Já existe um perfil para este usuário. Não é possível criar outro perfil.";
          }
          if (message.includes("cpf")) {
            return "Já existe um perfil com este CPF. Verifique o CPF informado.";
          }
          return "Dados duplicados. Verifique se o registro já existe.";
        }

        if (message.includes("Sem permissão") || 
            message.includes("permissão de acesso") ||
            message.includes("Forbidden") ||
            message.includes("Access denied")) {
          return "Sem permissão de acesso. Esta ação requer role ADMIN ou ADMIN_MASTER.";
        }

        return message;
      }

      // Mensagens padrão baseadas no tipo
      switch (type) {
        case ApiErrorType.VALIDATION:
          return "Dados inválidos. Verifique os campos preenchidos.";
        case ApiErrorType.UNAUTHORIZED:
          return "Sessão expirada. Faça login novamente.";
        case ApiErrorType.FORBIDDEN:
          return "Sem permissão de acesso. Esta ação requer role ADMIN ou ADMIN_MASTER.";
        case ApiErrorType.NOT_FOUND:
          return "Registro não encontrado.";
        case ApiErrorType.SERVER_ERROR:
          return "Erro interno do servidor. Tente novamente mais tarde ou entre em contato com o suporte.";
        case ApiErrorType.NETWORK_ERROR:
          return "Erro de conexão. Verifique sua internet e tente novamente.";
        default:
          return "Erro desconhecido. Tente novamente mais tarde.";
      }
    },
    []
  );

  /**
   * Processa um erro e retorna um objeto padronizado
   */
  const processError = useCallback(
    (error: any): ProcessedError => {
      const status = error?.status || error?.statusCode || error?.response?.status;
      const type = getErrorType(status, error);
      const rawMessage = extractErrorMessage(error);
      const message = enhanceErrorMessage(rawMessage, type, error);

      return {
        message,
        type,
        originalError: error,
        statusCode: status,
        details: error?.data || error?.response?.data,
      };
    },
    [extractErrorMessage, getErrorType, enhanceErrorMessage]
  );

  /**
   * Obtém apenas a mensagem de erro (método simplificado)
   */
  const getErrorMessage = useCallback(
    (error: any): string => {
      const processed = processError(error);
      return processed.message;
    },
    [processError]
  );

  /**
   * Verifica se o erro é de um tipo específico
   */
  const isErrorType = useCallback(
    (error: any, type: ApiErrorType): boolean => {
      const processed = processError(error);
      return processed.type === type;
    },
    [processError]
  );

  /**
   * Verifica se o erro é de validação
   */
  const isValidationError = useCallback(
    (error: any): boolean => {
      return isErrorType(error, ApiErrorType.VALIDATION);
    },
    [isErrorType]
  );

  /**
   * Verifica se o erro é de autorização
   */
  const isUnauthorizedError = useCallback(
    (error: any): boolean => {
      return isErrorType(error, ApiErrorType.UNAUTHORIZED);
    },
    [isErrorType]
  );

  /**
   * Verifica se o erro é de permissão
   */
  const isForbiddenError = useCallback(
    (error: any): boolean => {
      return isErrorType(error, ApiErrorType.FORBIDDEN);
    },
    [isErrorType]
  );

  /**
   * Verifica se o erro é de não encontrado
   */
  const isNotFoundError = useCallback(
    (error: any): boolean => {
      return isErrorType(error, ApiErrorType.NOT_FOUND);
    },
    [isErrorType]
  );

  /**
   * Verifica se o erro é do servidor
   */
  const isServerError = useCallback(
    (error: any): boolean => {
      return isErrorType(error, ApiErrorType.SERVER_ERROR);
    },
    [isErrorType]
  );

  /**
   * Verifica se o erro é de rede
   */
  const isNetworkError = useCallback(
    (error: any): boolean => {
      return isErrorType(error, ApiErrorType.NETWORK_ERROR);
    },
    [isErrorType]
  );

  return {
    processError,
    getErrorMessage,
    isErrorType,
    isValidationError,
    isUnauthorizedError,
    isForbiddenError,
    isNotFoundError,
    isServerError,
    isNetworkError,
    ApiErrorType,
  };
};
