import { httpClient } from "../httpClient";

const API_URL = import.meta.env.VITE_API_URL as string || "http://186.248.135.172:31535";

export interface StudentData {
  id: number;
  completeName: string;
  registration: string;
  corp_email: string;
  monitor: string;
  status: string;
  cpf: string;
  birth_date: string;
  username: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const studentDataService = {
  /**
   * Lista todos os alunos com paginação
   * @param page - Número da página (padrão: 1)
   * @param size - Itens por página (padrão: 10)
   * @param search - Termo de busca opcional
   */
  list: (page: number = 1, size: number = 10, search?: string) => {
    return httpClient.get<PaginatedResponse<StudentData>>(
      API_URL,
      "/admin/student-data",
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
   * Obtém detalhes de um aluno específico
   * @param id - ID do aluno
   */
  getById: (id: string | number) =>
    httpClient.get<StudentData>(
      API_URL,
      `/admin/student-data/${id}`
    ),

  /**
   * Cria um novo aluno
   * @param payload - Dados do aluno
   */
  create: (payload: Partial<StudentData>) =>
    httpClient.post<{ id: number; message: string }>(
      API_URL,
      "/admin/student-data",
      payload
    ),

  /**
   * Atualiza dados de um aluno
   * @param id - ID do aluno
   * @param payload - Dados atualizados
   */
  update: (id: string | number, payload: Partial<StudentData>) =>
    httpClient.patch<{ message: string }>(
      API_URL,
      "/admin/student-data",
      id,
      payload
    ),

  /**
   * Deleta um aluno
   * @param id - ID do aluno
   */
  delete: (id: string | number) =>
    httpClient.delete<{ message: string }>(
      API_URL,
      "/admin/student-data",
      id
    ),
};
