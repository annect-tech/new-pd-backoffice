export interface ResponseModel<T = any> {
  status: number;
  message: string;
  data?: T;
}

export interface RequestOptions {
  queryParams?: Record<string, string | number | boolean | null | undefined>;
  skipAuth?: boolean;
}

let _authToken: string | null = null;
let _onUnauthorized: (() => Promise<void>) | null = null;
let _isRefreshing = false;
let _refreshPromise: Promise<void> | null = null;

export const httpClient = {
  setAuthToken(token: string | null) {
    _authToken = token;
  },

  setOnUnauthorized(callback: () => Promise<void>) {
    _onUnauthorized = callback;
  },

  /**
   * Constrói query string a partir de objeto de parâmetros
   */
  _buildQueryString(params: Record<string, string | number | boolean | null | undefined>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  },

  /**
   * Verifica se o payload é FormData
   */
  _isFormData(payload: any): payload is FormData {
    return payload instanceof FormData;
  },

  /**
   * Faz requisição HTTP com suporte a FormData, query params e refresh token automático
   */
  async request<T = any>(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    baseUrl: string,
    endpoint: string,
    payload?: any,
    options?: RequestOptions
  ): Promise<ResponseModel<T>> {
    // Construir URL com query params se fornecidos
    let url = `${baseUrl.replace(/\/$/, "")}${endpoint}`;
    if (options?.queryParams) {
      url += this._buildQueryString(options.queryParams);
    }

    const isRefreshTokenEndpoint = endpoint.includes('/auth/refresh-token');

    // Determinar se é FormData
    const isFormData = payload && this._isFormData(payload);

    // Preparar headers
    const headers: HeadersInit = {};
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
    // Não definir Content-Type para FormData - o navegador define automaticamente com boundary

    // Adicionar headers para evitar cache (especialmente para PATCH/PUT/DELETE)
    if (method === "PATCH" || method === "PUT" || method === "DELETE") {
      headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
      headers["Pragma"] = "no-cache";
      headers["Expires"] = "0";
    }

    if (!options?.skipAuth && _authToken) {
      headers["Authorization"] = `Bearer ${_authToken}`;
    }

    // Preparar body
    let body: BodyInit | undefined;
    if (payload) {
      body = isFormData ? payload : JSON.stringify(payload);
    }

    const opts: RequestInit = {
      method,
      headers,
      body,
      // Evitar cache para métodos que modificam dados
      cache: (method === "PATCH" || method === "PUT" || method === "DELETE" || method === "POST") 
        ? "no-store" 
        : "default",
    };

    try {
      const res = await fetch(url, opts);
      
      if (res.status === 401 && !options?.skipAuth && _onUnauthorized && !_isRefreshing) {
        _isRefreshing = true;
        _refreshPromise = _onUnauthorized().finally(() => {
          _isRefreshing = false;
          _refreshPromise = null;
        });

        await _refreshPromise;

        // Tentar novamente a requisição original com o novo token
        if (_authToken) {
          headers["Authorization"] = `Bearer ${_authToken}`;
          const retryRes = await fetch(url, { ...opts, headers });
          const retryJson = await retryRes.json();
          
          return {
            status: retryRes.status,
            message: retryJson.message ?? retryRes.statusText,
            data: retryJson.data ?? retryJson,
          };
        }
      }

      // Se ainda estiver refrescando, aguardar
      if (_isRefreshing && _refreshPromise && !options?.skipAuth && !isRefreshTokenEndpoint) {
        await _refreshPromise;
        // Tentar novamente após refresh
        if (_authToken) {
          headers["Authorization"] = `Bearer ${_authToken}`;
          const retryRes = await fetch(url, { ...opts, headers });
          const retryJson = await retryRes.json();
          
          return {
            status: retryRes.status,
            message: retryJson.message ?? retryRes.statusText,
            data: retryJson.data ?? retryJson,
          };
        }
      }

      // Tentar fazer parse do JSON
      let json: any;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          json = await res.json();
        } catch (e) {
          // Se não conseguir fazer parse, retornar resposta vazia
          json = {};
        }
      } else {
        // Se não for JSON, retornar texto ou vazio
        const text = await res.text();
        json = text ? { message: text } : {};
      }

      // Se ainda for 401 após refresh, chamar callback de unauthorized
      if (res.status === 401 && _onUnauthorized && !options?.skipAuth) {
        _onUnauthorized();
      }

      let message = json.message ?? res.statusText;
      
      // Tratar erros 4xx e 5xx
      if (res.status >= 400) {
        if (json.error) {
          message = typeof json.error === 'string' ? json.error : JSON.stringify(json.error);
        } else if (json.message) {
          message = json.message;
        } else if (typeof json === 'string') {
          message = json;
        } else if (json.statusCode && json.message) {
          message = json.message;
        } else if (res.status === 500) {
          // Tentar extrair stack trace ou detalhes do erro para 500
          if (json.stack) {
            message = `Erro interno: ${json.stack}`;
          } else if (json.details) {
            message = `Erro interno: ${JSON.stringify(json.details)}`;
          } else {
            message = `Erro interno do servidor (500). Detalhes: ${JSON.stringify(json)}`;
          }
        }
      }

      // Determinar o que retornar como data
      // Se json tem propriedade 'data' E propriedades de paginação, manter estrutura completa (PaginatedResponse)
      // Caso contrário, retornar json.data se existir, senão retornar json completo
      let responseData: any;
      
      // Verificar se é objeto (não array) e tem propriedade 'data'
      if (typeof json === 'object' && !Array.isArray(json) && json.data !== undefined) {
        // Verificar se tem propriedades de paginação
        const hasPaginationProps = 'currentPage' in json || 'itemsPerPage' in json || 'totalItems' in json || 'totalPages' in json;
        if (hasPaginationProps) {
          // É PaginatedResponse - manter estrutura completa
          responseData = json;
        } else {
          // Tem 'data' mas não é estrutura de paginação - retornar apenas data
          responseData = json.data;
        }
      } else {
        // Não tem 'data' ou é array - retornar json completo
        responseData = json;
      }
      
      return {
        status: res.status,
        message: message,
        data: responseData,
      };
    } catch (err: any) {
      return { 
        status: 0, 
        message: err.message || "Network error",
        data: undefined 
      };
    }
  },

  get<T>(baseUrl: string, endpoint: string, options?: RequestOptions) {
    return this.request<T>("GET", baseUrl, endpoint, undefined, options);
  },

  post<T>(baseUrl: string, endpoint: string, payload?: any, options?: RequestOptions) {
    return this.request<T>("POST", baseUrl, endpoint, payload, options);
  },

  put<T>(baseUrl: string, endpoint: string, id: string | number, payload: any, options?: RequestOptions) {
    return this.request<T>("PUT", baseUrl, `${endpoint}/${id}`, payload, options);
  },

  delete<T>(baseUrl: string, endpoint: string, id: string | number, options?: RequestOptions) {
    return this.request<T>("DELETE", baseUrl, `${endpoint}/${id}`, undefined, options);
  },

  patch<T>(
    baseUrl: string,
    endpoint: string,
    id: string | number,
    payload: any,
    options?: RequestOptions
  ) {
    return this.request<T>("PATCH", baseUrl, `${endpoint}/${id}`, payload, options);
  },

  customPatch<T>(
    baseUrl: string,
    endpoint: string,
    payload?: any,
  ) {
    return this.request<T>("PATCH", baseUrl, endpoint, payload);
  },

  /**
   * Método específico para upload de arquivo único (FormData)
   */
  uploadFile<T>(baseUrl: string, endpoint: string, file: File, additionalData?: Record<string, any>, options?: RequestOptions) {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });
    }

    return this.request<T>("POST", baseUrl, endpoint, formData, options);
  },

  /**
   * Método específico para upload de múltiplos arquivos (FormData)
   */
  uploadFiles<T>(baseUrl: string, endpoint: string, files: File[], additionalData?: Record<string, any>, options?: RequestOptions) {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });
    }

    return this.request<T>("POST", baseUrl, endpoint, formData, options);
  },
};
