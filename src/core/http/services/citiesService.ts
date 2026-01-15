import { httpClient } from "../httpClient";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface CityDataPayload {
  cidade: string;
  uf: string;
  active: boolean;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cnpj?: string;
  tenant_city_id?: string;
}

export interface City extends CityDataPayload {
  id: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const citiesService = {
  /**
   * Lista todas as cidades com paginação
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    return httpClient.get<PaginatedResponse<City>>(
      API_URL,
      "/admin/allowed-cities",
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
   * Cria uma nova cidade
   * @param payload - Dados da cidade
   */
  create: (payload: CityDataPayload) =>
    httpClient.post<{ id: number; message: string }>(
      API_URL,
      "/admin/allowed-cities",
      payload
    ),

  /**
   * Atualiza uma cidade existente
   * @param id - ID da cidade
   * @param payload - Dados atualizados
   */
  update: (id: string | number, payload: Partial<CityDataPayload>) =>
    httpClient.patch<{ message: string }>(
      API_URL,
      "/admin/allowed-cities",
      id,
      payload
    ),

  /**
   * Deleta uma cidade
   * @param id - ID da cidade
   */
  delete: (id: string | number) =>
    httpClient.delete<{ message: string }>(
      API_URL,
      "/admin/allowed-cities",
      id
    ),
};
