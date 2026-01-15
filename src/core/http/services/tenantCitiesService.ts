import { httpClient } from "../httpClient";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface TenantCity {
  id: string;
  domain: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantCityPayload {
  domain?: string;
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
   * Lista todas as Tenant Cities com paginação
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    return httpClient.get<PaginatedResponse<TenantCity>>(
      API_URL,
      "/admin/tenant-cities",
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
   * Cria uma nova Tenant City
   * @param payload - Dados da Tenant City (domain)
   */
  create: (payload: TenantCityPayload) =>
    httpClient.post<CreateTenantCityResponse>(
      API_URL,
      "/admin/tenant-cities",
      payload
    ),

  /**
   * Atualiza uma Tenant City existente
   * @param id - ID da Tenant City
   * @param payload - Dados atualizados
   */
  update: (id: string | number, payload: TenantCityPayload) =>
    httpClient.patch<UpdateTenantCityResponse>(
      API_URL,
      "/admin/tenant-cities",
      id,
      payload
    ),

  /**
   * Deleta uma Tenant City
   * @param id - ID da Tenant City
   */
  delete: (id: string | number) =>
    httpClient.delete<DeleteTenantCityResponse>(
      API_URL,
      "/admin/tenant-cities",
      id
    ),
};
