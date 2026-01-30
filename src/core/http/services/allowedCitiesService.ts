import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface AllowedCity {
  id: string;
  cidade: string;
  uf: string;
  active: boolean;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cnpj: string | null;
  tenant_city_id: string | null;
  // Campos legados para compatibilidade (se a API ainda retornar)
  name?: string;
  createdAt?: string;
}

export interface AllowedCityPayload {
  cidade: string;
  uf: string;
  active: boolean;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cnpj: string;
  tenant_city_id: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CreateAllowedCityResponse {
  id: string;
  message: string;
}

export interface UpdateAllowedCityResponse {
  message: string;
}

export interface DeleteAllowedCityResponse {
  message: string;
}

export const allowedCitiesService = {
  /**
   * Lista todas as Allowed Cities com paginação
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    const prefix = getEndpointPrefix();
    // Swagger: page e size devem ser >= 1; search só enviado se tiver valor
    const safePage = Math.max(1, page);
    const safeSize = Math.max(1, size);
    const queryParams: Record<string, string | number> = {
      page: safePage,
      size: safeSize,
    };
    if (search != null && search.trim() !== "") {
      queryParams.search = search.trim();
    }
    return httpClient.get<PaginatedResponse<AllowedCity>>(
      API_URL,
      `/${prefix}/allowed-cities`,
      { queryParams }
    );
  },

  /**
   * Busca uma Allowed City por ID
   * @param id - ID da Allowed City
   */
  findOne: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<AllowedCity>(
      API_URL,
      `/${prefix}/allowed-cities/${id}`
    );
  },

  /**
   * Cria uma nova Allowed City
   * @param payload - Dados da Allowed City (name, tenant_city_id)
   */
  create: (payload: AllowedCityPayload) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<CreateAllowedCityResponse>(
      API_URL,
      `/${prefix}/allowed-cities`,
      payload
    );
  },

  /**
   * Atualiza uma Allowed City existente
   * @param id - ID da Allowed City
   * @param payload - Dados atualizados
   */
  update: (id: string | number, payload: Partial<AllowedCityPayload>) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<UpdateAllowedCityResponse>(
      API_URL,
      `/${prefix}/allowed-cities`,
      id,
      payload
    );
  },

  /**
   * Deleta uma Allowed City
   * @param id - ID da Allowed City
   */
  delete: (id: string | number) => {
    const prefix = getEndpointPrefix();
    return httpClient.delete<DeleteAllowedCityResponse>(
      API_URL,
      `/${prefix}/allowed-cities`,
      id
    );
  },
};
