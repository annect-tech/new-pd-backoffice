import { httpClient } from "../httpClient";
import { getEndpointPrefix } from "../utils/endpointPrefix";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface Address {
  id: number;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  reference: string | null;
  tenant_city_id: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AddressPayload {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  reference?: string;
  tenant_city_id?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface CreateAddressResponse {
  id: number;
  message: string;
  address: Address;
}

export interface UpdateAddressResponse {
  message: string;
  address: Address;
}

export interface DeleteAddressResponse {
  message: string;
}

export const addressesService = {
  /**
   * Lista todos os endereços com paginação e filtros
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   * @param filters - Filtros opcionais (city, state, neighborhood, include_deleted)
   */
  list: (
    page: number = 1,
    size: number = 10,
    search?: string,
    filters?: {
      city?: string;
      state?: string;
      neighborhood?: string;
      include_deleted?: boolean;
    }
  ) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<PaginatedResponse<Address>>(
      API_URL,
      `/${prefix}/addresses`,
      {
        queryParams: {
          page,
          size,
          ...(search ? { search } : {}),
          ...(filters?.city ? { city: filters.city } : {}),
          ...(filters?.state ? { state: filters.state } : {}),
          ...(filters?.neighborhood ? { neighborhood: filters.neighborhood } : {}),
          ...(filters?.include_deleted !== undefined ? { include_deleted: filters.include_deleted } : {}),
        },
      }
    );
  },

  /**
   * Busca um endereço por ID
   * @param id - ID do endereço
   */
  findOne: (id: number | string) => {
    const prefix = getEndpointPrefix();
    return httpClient.get<Address>(
      API_URL,
      `/${prefix}/addresses/${id}`
    );
  },

  /**
   * Cria um novo endereço
   * @param payload - Dados do endereço (pode ser AddressPayload ou formato da API em português)
   */
  create: (payload: AddressPayload | any) => {
    const prefix = getEndpointPrefix();
    return httpClient.post<CreateAddressResponse>(
      API_URL,
      `/${prefix}/addresses`,
      payload
    );
  },

  /**
   * Atualiza um endereço existente
   * @param id - ID do endereço
   * @param payload - Dados atualizados (pode ser AddressPayload ou formato da API em português)
   */
  update: (id: number | string, payload: Partial<AddressPayload> | any) => {
    const prefix = getEndpointPrefix();
    return httpClient.patch<UpdateAddressResponse>(
      API_URL,
      `/${prefix}/addresses`,
      id,
      payload
    );
  },

  /**
   * Deleta um endereço (soft delete)
   * @param id - ID do endereço
   */
  delete: (id: number | string) => {
    const prefix = getEndpointPrefix();
    return httpClient.delete<DeleteAddressResponse>(
      API_URL,
      `/${prefix}/addresses`,
      id
    );
  },
};
