import { getApiUrl } from "../apiUrl";
import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";

const API_URL = getApiUrl();

export interface TenantCity {
  id: string;
  name?: string | null;
  domain: string | null;
  tag?: string | null;
  activeProcessId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantCityPayload {
  name: string;
  domain: string;
  tag: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CreateTenantCityResponse {
  id: string;
  message: string;
}

export interface UpdateTenantCityResponse {
  message: string;
}

export interface DeleteTenantCityResponse {
  message: string;
}

export const tenantCitiesService = {
  /**
   * Lista todas as Cidades Sedes com paginação
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<TenantCity>>(
      API_URL,
      `/${prefix}/tenant-cities`,
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
   * Cria uma nova Cidade Sede
   * @param payload - Dados da Cidade Sede (domain)
   */
  create: (payload: TenantCityPayload) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<CreateTenantCityResponse>(
      API_URL,
      `/${prefix}/tenant-cities`,
      payload
    );
  },

  /**
   * Atualiza uma Cidade Sede existente
   * @param id - ID da Cidade Sede
   * @param payload - Dados atualizados
   */
  update: (id: string | number, payload: TenantCityPayload) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<UpdateTenantCityResponse>(
      API_URL,
      `/${prefix}/tenant-cities`,
      id,
      payload
    );
  },

  /**
   * Deleta uma Cidade Sede
   * @param id - ID da Cidade Sede
   */
  delete: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.delete<DeleteTenantCityResponse>(
      API_URL,
      `/${prefix}/tenant-cities`,
      id
    );
  },
};
